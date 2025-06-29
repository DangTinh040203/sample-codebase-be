import { Module } from '@nestjs/common';

import { AppController } from '@/app.controller';
import { AppConfig } from '@/configs/app.config';

@Module({
  imports: [...AppConfig],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
