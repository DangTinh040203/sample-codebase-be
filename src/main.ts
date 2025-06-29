import { type INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';

import { AppModule } from '@/app.module';
import { Env } from '@/constants';

class BootstrapApplication {
  app: INestApplication;
  private configService: ConfigService;

  async run() {
    this.app = await NestFactory.create(AppModule);

    this.configService = this.app.get(ConfigService);
    const port = this.configService.get<number>(Env.PORT) || 3000;

    this.setupMiddleware();

    await this.app.listen(port);
    Logger.log(`Server running on http://localhost:${port}`);
  }

  private setupMiddleware() {
    this.app.use(cookieParser());
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    this.app.enableCors({
      origin: this.configService.get<string>(Env.FRONT_END_ORIGIN) as string,
      credentials: true,
    });

    this.app.use(helmet());
    this.app.use(morgan('dev'));
  }
}

void new BootstrapApplication().run();
