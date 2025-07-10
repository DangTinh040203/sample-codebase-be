import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignUpWithCredentialsDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
