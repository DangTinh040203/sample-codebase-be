import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import { diskStorage } from 'multer';

import { type CustomRequest, type JwtPayload } from '@/common/@types';

export const UPLOAD_DESTINATION = 'uploads/photo';

export const storage = diskStorage({
  destination: (req, file, cb) => {
    const jwtPayload: JwtPayload = req.user as JwtPayload;

    try {
      fs.mkdirSync(`${UPLOAD_DESTINATION}/${jwtPayload._id}`, {
        recursive: true,
      });
      cb(null, `${UPLOAD_DESTINATION}/${jwtPayload._id}`);
    } catch (error) {
      Logger.error('Error creating uploads directory:', error);
      cb(error, `${UPLOAD_DESTINATION}/${jwtPayload._id}`);
    }
  },

  filename: (req: CustomRequest, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  },
});
