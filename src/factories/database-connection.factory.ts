import { Logger } from '@nestjs/common';
import { type ConfigService } from '@nestjs/config';
import { type Connection, ConnectionStates } from 'mongoose';

import { Env } from '@/constants';

export const databaseConnectionFactory = (config: ConfigService) => {
  const nodeEnv = config.get<string>(Env.NODE_ENV) ?? 'development';
  const uri = config.get<string>(Env.MONGO_CONNECTION_STRING);

  return {
    uri,
    connectionFactory: (connection: Connection): Connection => {
      const logger = new Logger('DatabaseConnectionFactory');

      if (connection.readyState === ConnectionStates.connected) {
        logger.log(`[✅ ${nodeEnv}] Database connected successfully.`);
      }
      connection.on('disconnected', () => {
        logger.warn(`[${nodeEnv}] Database disconnected.`);
      });
      connection.on('error', (error) => {
        logger.error(`[${nodeEnv}] Database connection error:`, error);
      });

      return connection;
    },
  };
};
