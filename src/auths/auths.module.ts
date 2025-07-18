import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountModule } from '@/accounts/accounts.module';
import { AccountsService } from '@/accounts/accounts.service';
import { AuthsController } from '@/auths/auths.controller';
import { AuthsService } from '@/auths/auths.service';
import { KeyToken, keyTokenSchema } from '@/auths/entities/key-token.entity';
import { UserOtp, UserOtpSchema } from '@/auths/entities/user-otp.entity';
import { EmailModule } from '@/emails/emails.module';
import { EmailsService } from '@/emails/emails.service';
import { User, UserSchema } from '@/users/entities/user.entity';
import { UsersService } from '@/users/users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserOtp.name, schema: UserOtpSchema },
      { name: User.name, schema: UserSchema },
      { name: KeyToken.name, schema: keyTokenSchema },
    ]),
    AccountModule,
    EmailModule,
  ],
  controllers: [AuthsController],
  providers: [
    EmailsService,
    AuthsService,
    AccountsService,
    UsersService,
    JwtService,
  ],
  exports: [AuthsService],
})
export class AuthsModule {}
