import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { createReadStream } from 'fs';
import * as fs from 'fs';
import mime from 'mime-types';
import path, { join } from 'path';

import { Public } from '@/auths/decorators/public.decorator';
import { JwtAuthGuard } from '@/auths/guards/jwt-auth.guard';
import { CustomRequest } from '@/common/@types';
import {
  storage,
  UPLOAD_DESTINATION,
} from '@/common/configs/upload-storage.config';
import { Env } from '@/common/constants';
import { CvBuilderService } from '@/cv-builder/cv-builder.service';

@UseGuards(JwtAuthGuard)
@Controller('cv-builder')
export class CvBuilderController {
  constructor(
    private readonly cvBuilderService: CvBuilderService,
    private config: ConfigService,
  ) {}

  @Post('avatar/upload')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage,
      limits: { fileSize: 1024 * 1024 * 3 }, // 3 MB
      fileFilter(req, file, callback) {
        const ext = path.extname(file.originalname).toLowerCase();
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];

        if (!allowedExtensions.includes(ext)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadAvatar(
    @UploadedFile()
    file: Express.Multer.File,
    @Request() req: CustomRequest,
  ) {
    const baseUrl = this.config.getOrThrow<string>(Env.IMAGE_BASE_URL);
    const url = `${baseUrl}/${req.user._id}/${file.filename}`;
    return url;
  }

  @Public()
  @Get(':userId/:filename')
  getAvatar(@Param('userId') userId, @Param('filename') filename, @Res() res) {
    const filePath = join(process.cwd(), UPLOAD_DESTINATION, userId, filename);
    if (!fs.existsSync(filePath)) throw new NotFoundException();
    res.setHeader(
      'Content-Type',
      mime.lookup(filename) || 'application/octet-stream',
    );

    createReadStream(filePath).pipe(res);
  }
}
