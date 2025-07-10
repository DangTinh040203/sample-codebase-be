import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 6) // Assuming OTP is a 6-digit code
  otp: string;
}
