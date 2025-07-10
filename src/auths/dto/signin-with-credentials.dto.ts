import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignInWithCredentialsDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}
