import { type CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

import { Env } from '@/common/constants';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const store = await redisStore({
      socket: {
        host: configService.getOrThrow<string>(Env.REDIS_HOST),
        port: parseInt(configService.getOrThrow<string>(Env.REDIS_PORT)),
      },
    });
    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};
