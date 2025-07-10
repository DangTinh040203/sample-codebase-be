import { type DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { Env } from '@/common/constants';

export const mailerConfig: DynamicModule = MailerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    transport: {
      host: configService.get<string>(Env.EMAIL_HOST),
      port: configService.get<number>(Env.EMAIL_PORT),
      secure: true,
      auth: {
        user: configService.get<string>(Env.EMAIL_USERNAME),
        pass: configService.get<string>(Env.EMAIL_PASSWORD),
      },
    },
    defaults: {
      from: `"Cv Builder" <${configService.get<string>(Env.EMAIL_USERNAME)}>`,
    },
  }),
});
