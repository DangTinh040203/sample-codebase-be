import { Module } from '@nestjs/common';

import { AppController } from '@/app.controller';
import { AppConfig } from '@/common/configs/app.config';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [...AppConfig, UsersModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
