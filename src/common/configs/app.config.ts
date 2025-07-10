import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { validationSchema } from '@/common/configs/env.config';
import { jwtConfig } from '@/common/configs/jwt.config';
import { mailerConfig } from '@/common/configs/mailer.config';
import { MongooseConfig } from '@/common/configs/mongoose.config';
import { RedisOptions } from '@/common/configs/redis.config';

const envFilePath =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';

export const GlobalConfig = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema,
  envFilePath,
});

export const AppConfig = [
  MongooseConfig,
  GlobalConfig,
  JwtModule.registerAsync({
    imports: [],
    inject: [ConfigService],
    useFactory: jwtConfig,
  }),
  CacheModule.registerAsync(RedisOptions),
  mailerConfig,
];
