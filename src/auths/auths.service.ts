import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt, { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';

import { AccountsService } from '@/accounts/accounts.service';
import { SignInWithCredentialsDto } from '@/auths/dto/signin-with-credentials.dto';
import { SignUpWithCredentialsDto } from '@/auths/dto/signup-with-credentials.dto';
import { VerifyOtpDto } from '@/auths/dto/verify-otp.dto';
import { KeyToken } from '@/auths/entities/key-token.entity';
import { UserOtp } from '@/auths/entities/user-otp.entity';
import { JwtPayload } from '@/common/@types';
import { Env } from '@/common/constants';
import { convertToObjectId } from '@/common/utils/convertToObjectId.util';
import { GenerateCacheKeys } from '@/common/utils/generateCacheKeys';
import { generateSecureOtp } from '@/common/utils/generateSecureOtp';
import { EmailsService } from '@/emails/emails.service';
import { UsersService } from '@/users/users.service';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel(UserOtp.name) private readonly userOtpModel: Model<UserOtp>,
    @InjectModel(KeyToken.name) private readonly keyTokenModel: Model<KeyToken>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    private readonly emailService: EmailsService,
    private readonly accountsService: AccountsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async signUpWithCredentials({ email, password }: SignUpWithCredentialsDto) {
    const account = await this.accountsService.findByEmail(email);
    if (account) {
      throw new ConflictException(['Email already exists']);
    }

    await this.accountsService.createAccount(email, password);

    const otp = generateSecureOtp();
    const ttl = 6 * 1000;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    const cacheKey = GenerateCacheKeys.userOtp(email);

    await Promise.all([
      this.cacheManager.set(cacheKey, otp, ttl),
      this.userOtpModel.create({ email, otp, expiresAt }),
    ]);

    Logger.log(otp, 'AuthService:signUp');

    await this.emailService.sendEmail(
      email,
      'Verify your Account',
      `Hello!\n\nYour OTP code is: ${otp}\n\nThanks for using our service.`,
    );
  }

  async verifyOtp({ email, otp }: VerifyOtpDto) {
    const account = await this.accountsService.findByEmail(email);
    if (!account) throw new NotFoundException(['Account not found']);
    if (account.isVerified)
      throw new ConflictException(['Account already verified']);

    const cacheKey = GenerateCacheKeys.userOtp(email);
    const failedKey = GenerateCacheKeys.otpFailed(email);
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCK_TIME_SECONDS = 5 * 60;

    const failedCount = await this.cacheManager.get<number>(failedKey);
    if (failedCount && failedCount >= MAX_FAILED_ATTEMPTS) {
      throw new ConflictException([
        'Too many failed attempts. Please try again later.',
      ]);
    }

    let isOtpValid = false;
    let otpExpired = false;
    const cacheOtp = await this.cacheManager.get<string>(cacheKey);

    if (cacheOtp) {
      isOtpValid = cacheOtp === otp;
    } else {
      const userOtp = await this.userOtpModel.findOne({ email });
      if (!userOtp) throw new NotFoundException();

      if (userOtp.expiresAt < new Date()) otpExpired = true;
      isOtpValid = userOtp.otp === otp && !otpExpired;

      if (otpExpired) {
        throw new ConflictException([
          'OTP has expired. Please request a new one.',
        ]);
      }

      if (!isOtpValid) {
        await this.cacheManager.set(
          failedKey,
          (failedCount || 0) + 1,
          LOCK_TIME_SECONDS,
        );
        Logger.warn(
          `Invalid OTP for ${email}. Fail count: ${(failedCount || 0) + 1}`,
        );
        throw new ConflictException(['OTP is invalid']);
      }

      await Promise.all([
        this.usersService.createUser({
          email,
          displayName: email.split('@')[0],
          avatar: 'https://github.com/shadcn.png',
        }),
        this.accountsService.updateByEmail(email, { isVerified: true }),
        this.cacheManager.del(cacheKey),
        this.userOtpModel.deleteOne({ email }),
        this.cacheManager.del(failedKey),
      ]);
      Logger.log(`OTP verified and account activated: ${email}`);
    }
  }

  async resendOtp(email: string) {
    const account = await this.accountsService.findByEmail(email);
    if (!account) throw new NotFoundException(['Account not found']);
    if (account.isVerified)
      throw new ConflictException(['Account already verified']);

    const COOL_DOWN_SECONDS = 60;
    const coolDownKey = `resetOtpCoolDown:${email}`;
    const coolDown = await this.cacheManager.get(coolDownKey);
    if (coolDown)
      throw new ConflictException(['Please wait before requesting a new OTP.']);
    await this.cacheManager.set(coolDownKey, 1, COOL_DOWN_SECONDS);

    const cacheKey = GenerateCacheKeys.userOtp(email);
    const failedKey = GenerateCacheKeys.otpFailed(email);
    await Promise.all([
      this.cacheManager.del(cacheKey),
      this.userOtpModel.deleteOne({ email }),
      this.cacheManager.del(failedKey),
    ]);

    const otp = generateSecureOtp();
    Logger.log(otp, 'AuthService:resend-otp');
    const ttl = 60;
    const expiresAt = new Date(Date.now() + ttl * 1000);
    await Promise.all([
      this.cacheManager.set(cacheKey, otp, ttl),
      this.userOtpModel.create({ email, otp, expiresAt }),
    ]);

    await this.emailService.sendEmail(
      email,
      'Your OTP code',
      `Hello!\n\nYour OTP code is: ${otp}\n\nThis code is valid for 60 seconds.\n\nThanks for using our service.`,
    );

    Logger.log(`Resent OTP to ${email}`);
  }

  async signInWithCredentials({ email, password }: SignInWithCredentialsDto) {
    const account = await this.accountsService.findByEmail(email);
    if (!account) throw new NotFoundException(['Account not found']);
    if (!account.isVerified)
      throw new ConflictException(['Account is not verified']);

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new ConflictException(['Invalid email or password']);
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(['User not found']);
    }

    const tokens = await this.tokensGenerator(user._id.toString());

    // Upsert the refresh token in the keyToken collection
    const SALT = 10;
    const hashedRefreshToken = await hash(tokens.refreshToken, SALT);
    await this.keyTokenModel.findOneAndUpdate(
      { userId: user._id },
      {
        $set: { hashedRefreshToken },
      },
      { upsert: true, new: true },
    );

    return tokens;
  }

  async signOut() {}

  async refreshToken(jwtPayload: JwtPayload, refreshToken: string) {
    const tokens = await this.tokensGenerator(jwtPayload._id);

    const SALT = 10;
    const hashedRefreshToken = await hash(tokens.refreshToken, SALT);

    await this.keyTokenModel.updateOne(
      { userId: convertToObjectId(jwtPayload._id) },
      {
        $set: { hashedRefreshToken },
        $push: { refreshTokensUsed: refreshToken },
      },
      { upsert: true, new: true },
    );

    return tokens;
  }

  async tokensGenerator(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { _id: userId },
        {
          secret: this.configService.get(Env.JWT_SECRET),
          expiresIn: this.configService.get(Env.JWT_ACCESS_TOKEN_EXPIRES_IN),
        },
      ),
      this.jwtService.signAsync(
        { _id: userId },
        {
          secret: this.configService.get(Env.JWT_SECRET),
          expiresIn: this.configService.get(Env.JWT_REFRESH_TOKEN_EXPIRES_IN),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  async isValidRefreshToken(userId: string, refreshToken: string) {
    const keyToken = await this.keyTokenModel.findOne({
      userId: convertToObjectId(userId),
    });

    if (!keyToken) {
      throw new NotFoundException(['User not found']);
    }

    const isUsed = keyToken.refreshTokensUsed.includes(refreshToken);
    if (isUsed) {
      throw new UnauthorizedException(['Refresh token has been used']);
    }

    const isValid = await compare(refreshToken, keyToken.hashedRefreshToken);
    return isValid;
  }
}
