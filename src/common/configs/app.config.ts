import { ConfigModule } from '@nestjs/config';

import { validationSchema } from '@/common/configs/env.config';
import { MongooseConfig } from '@/common/configs/mongoose.config';

const envFilePath =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.local';

export const GlobalConfig = ConfigModule.forRoot({
  isGlobal: true,
  validationSchema,
  envFilePath,
});

export const AppConfig = [MongooseConfig, GlobalConfig];
