import { Module } from '@nestjs/common';

import { AccountModule } from '@/accounts/accounts.module';
import { AppController } from '@/app.controller';
import { AuthsModule } from '@/auths/auths.module';
import { AtStrategy } from '@/auths/strategies/at.strategy';
import { RtStrategy } from '@/auths/strategies/rt.strategy';
import { AppConfig } from '@/common/configs/app.config';
import { CvBuilderModule } from '@/cv-builder/cv-builder.module';
import { HealthController } from '@/health/health.controller';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    ...AppConfig,
    UsersModule,
    AuthsModule,
    AccountModule,
    CvBuilderModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AtStrategy, RtStrategy],
})
export class AppModule {}
