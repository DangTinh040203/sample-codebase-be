import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type HydratedDocument } from 'mongoose';
import slugify from 'slugify';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: true })
  avatar: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  slug: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.pre<UserDocument>('save', function (next) {
  if (this.isModified('displayName')) {
    this.slug = slugify(this.displayName as string, {
      lower: true,
      strict: true,
    });
  }
  next();
});
