import {
  Body,
  Controller,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { AuthsService } from '@/auths/auths.service';
import { Public } from '@/auths/decorators/public.decorator';
import { ResendDto } from '@/auths/dto/resend-otp.dto';
import { SignInWithCredentialsDto } from '@/auths/dto/signin-with-credentials.dto';
import { SignUpWithCredentialsDto } from '@/auths/dto/signup-with-credentials.dto';
import { VerifyOtpDto } from '@/auths/dto/verify-otp.dto';
import { JwtAuthGuard } from '@/auths/guards/jwt-auth.guard';
import { JwtAuthGuardRefreshJWT } from '@/auths/guards/refresh-jwt-auth.guard';
import { CustomRequest } from '@/common/@types';

@Controller('auth')
export class AuthsController {
  constructor(private readonly authsService: AuthsService) {}

  @Public()
  @Post('sign-up')
  async signUpWithCredentials(@Body() dto: SignUpWithCredentialsDto) {
    return await this.authsService.signUpWithCredentials(dto);
  }

  @Public()
  @Post('sign-in')
  async signInWithCredentials(@Body() dto: SignInWithCredentialsDto) {
    return await this.authsService.signInWithCredentials(dto);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    return await this.authsService.verifyOtp(dto);
  }

  @Public()
  @Post('resend-otp')
  async resendOtp(@Body() dto: ResendDto) {
    return await this.authsService.resendOtp(dto.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async signOut() {
    return await this.authsService.signOut();
  }

  @UseGuards(JwtAuthGuardRefreshJWT)
  @Post('refresh-token')
  async refreshToken(@Request() req: CustomRequest) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    return await this.authsService.refreshToken(req.user, refreshToken);
  }
}
