import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<Account>;

export enum AccountProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
}

@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({
    type: [String],
    enum: Object.values(AccountProvider),
    default: [],
  })
  provider: AccountProvider[];
}

export const AccountSchema = SchemaFactory.createForClass(Account);
