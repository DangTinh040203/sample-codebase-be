import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { hash } from 'bcrypt';
import { Model } from 'mongoose';

import { AccountsService } from '@/accounts/accounts.service';
import { SignInWithCredentialsDto } from '@/auths/dto/signin-with-credentials.dto';
import { SignUpWithCredentialsDto } from '@/auths/dto/signup-with-credentials.dto';
import { VerifyOtpDto } from '@/auths/dto/verify-otp.dto';
import { UserOtp } from '@/auths/entities/user-otp.entity';
import { GenerateCacheKeys } from '@/common/utils/generateCacheKeys';
import { generateSecureOtp } from '@/common/utils/generateSecureOtp';
import { EmailsService } from '@/emails/emails.service';

@Injectable()
export class AuthsService {
  constructor(
    @InjectModel(UserOtp.name) private readonly userOtpModel: Model<UserOtp>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly emailService: EmailsService,
    private readonly accountsService: AccountsService,
  ) {}

  async signUpWithCredentials({ email, password }: SignUpWithCredentialsDto) {
    const account = await this.accountsService.findByEmail(email);
    if (account) {
      throw new ConflictException(['Email already exists']);
    }

    // Create a new account
    const SALT = 10;
    const hashedPassword: string = await hash(password, SALT);
    await this.accountsService.createAccount(email, hashedPassword);

    // Create and Send OTP
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

    // 2. Prepare cache keys for OTP and failed attempts
    const cacheKey = GenerateCacheKeys.userOtp(email);
    const failedKey = GenerateCacheKeys.otpFailed(email);
    const MAX_FAILED_ATTEMPTS = 5;
    const LOCK_TIME_SECONDS = 5 * 60; // 5 mins

    const failedCount = await this.cacheManager.get<number>(failedKey);
    if (failedCount && failedCount >= MAX_FAILED_ATTEMPTS) {
      throw new ConflictException([
        'Too many failed attempts. Please try again later.',
      ]);
    }

    // 4. Validate OTP: Try cache first, fall back to database if needed
    let isOtpValid = false;
    let otpExpired = false;
    const cacheOtp = await this.cacheManager.get<string>(cacheKey);

    if (cacheOtp) {
      isOtpValid = cacheOtp === otp;
    } else {
      const userOtpDoc = await this.userOtpModel.findOne({ email });
      if (!userOtpDoc) throw new NotFoundException();

      if (userOtpDoc.expiresAt < new Date()) otpExpired = true;
      isOtpValid = userOtpDoc.otp === otp && !otpExpired;

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

      // OTP is valid: verify account, cleanup OTP and reset failed count
      await this.accountsService.updateByEmail(email, { isVerified: true });
      await Promise.all([
        this.cacheManager.del(cacheKey),
        this.userOtpModel.deleteOne({ email }),
        this.cacheManager.del(failedKey),
      ]);
      Logger.log(`OTP verified and account activated: ${email}`);
    }
  }

  async signInWithCredentials(dto: SignInWithCredentialsDto) {}

  async signOut() {}

  async refreshToken() {}
}
