import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class UserOtp {
  @Prop({ required: true, length: 6 })
  otp: string;

  @Prop({
    required: true,
    unique: true,
  })
  email: string;

  @Prop({ required: true }) expiresAt: Date;
}

export const UserOtpSchema = SchemaFactory.createForClass(UserOtp);
UserOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
