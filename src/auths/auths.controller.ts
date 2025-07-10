import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthsService } from '@/auths/auths.service';
import { Public } from '@/auths/decorators/public.decorator';
import { SignInWithCredentialsDto } from '@/auths/dto/signin-with-credentials.dto';
import { SignUpWithCredentialsDto } from '@/auths/dto/signup-with-credentials.dto';
import { VerifyOtpDto } from '@/auths/dto/verify-otp.dto';
import { JwtAuthGuard } from '@/auths/guards/jwt-auth.guard';

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

  @UseGuards(JwtAuthGuard)
  @Post('sign-out')
  async signOut() {
    return await this.authsService.signOut();
  }

  @Post('refresh-token')
  async refreshToken() {
    return await this.authsService.refreshToken();
  }
}
