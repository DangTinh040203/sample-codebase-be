import { type ConfigService } from '@nestjs/config';

import { Env } from '@/common/constants';

export const jwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>(Env.JWT_SECRET),
  signOptions: {
    expiresIn: configService.get<string>(Env.JWT_REFRESH_TOKEN_EXPIRES_IN),
  },
});
