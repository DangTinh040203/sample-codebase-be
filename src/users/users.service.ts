import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { convertToObjectId } from '@/common/utils/convertToObjectId.util';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string) {
    return await this.userModel.findById(convertToObjectId(id)).lean();
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).lean();
  }
}
