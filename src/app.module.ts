import { Module } from '@nestjs/common';

import { AccountModule } from '@/accounts/accounts.module';
import { AppController } from '@/app.controller';
import { AuthsModule } from '@/auths/auths.module';
import { AppConfig } from '@/common/configs/app.config';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [...AppConfig, UsersModule, AuthsModule, AccountModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
