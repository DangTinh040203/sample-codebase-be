import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

import { User } from '@/users/entities/user.entity';

@Schema({ timestamps: true })
export class KeyToken {
  @Prop({ required: true })
  hashedRefreshToken: string;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  userId: mongoose.Types.ObjectId;

  @Prop({ required: true })
  refreshTokensUsed: Array<string>;

  @Prop()
  googleAccessToken?: string;
}

export const keyTokenSchema = SchemaFactory.createForClass(KeyToken);
