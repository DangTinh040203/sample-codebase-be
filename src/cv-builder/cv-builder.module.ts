import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { CvBuilderController } from '@/cv-builder/cv-builder.controller';
import { CvBuilderService } from '@/cv-builder/cv-builder.service';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: '../uploads',
        filename: (req, file, cb) => {
          cb(null, `${file.originalname}-${Date.now()}`);
        },
      }),
    }),
  ],
  controllers: [CvBuilderController],
  providers: [CvBuilderService],
})
export class CvBuilderModule {}
