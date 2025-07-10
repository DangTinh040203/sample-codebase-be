import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountModule } from '@/accounts/accounts.module';
import { AccountsService } from '@/accounts/accounts.service';
import { AuthsController } from '@/auths/auths.controller';
import { AuthsService } from '@/auths/auths.service';
import { UserOtp, UserOtpSchema } from '@/auths/entities/user-otp.entity';
import { EmailModule } from '@/emails/emails.module';
import { EmailsService } from '@/emails/emails.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserOtp.name, schema: UserOtpSchema }]),
    AccountModule,
    EmailModule,
  ],
  controllers: [AuthsController],
  providers: [EmailsService, AuthsService, AccountsService],
})
export class AuthsModule {}
