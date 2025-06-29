import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { databaseConnectionFactory } from '@/common/factories/database-connection.factory';

export const MongooseConfig = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) =>
    databaseConnectionFactory(configService),
});
