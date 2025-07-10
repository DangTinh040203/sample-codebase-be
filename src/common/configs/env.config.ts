import Joi from 'joi';

import { Env } from '@/common/constants';

export const validationSchema = Joi.object({
  [Env.PORT]: Joi.number().default(3000),
  [Env.MONGO_CONNECTION_STRING]: Joi.string().uri().required(),

  [Env.GOOGLE_CLIENT_ID]: Joi.string().required(),
  [Env.GOOGLE_CLIENT_SECRET]: Joi.string().required(),
  [Env.GOOGLE_CALLBACK_URL]: Joi.string().uri().required(),

  [Env.ADMIN_EMAIL]: Joi.string().email().required(),
  [Env.ADMIN_PASSWORD]: Joi.string().required(),

  [Env.CLOUDFRONT_URL]: Joi.string().uri(),
  [Env.AWS_S3_BUCKET_REGION]: Joi.string().required(),
  [Env.AWS_S3_BUCKET_NAME]: Joi.string().required(),
  [Env.AWS_S3_BUCKET_ACCESS_KEY]: Joi.string().required(),
  [Env.AWS_S3_BUCKET_SECRET_KEY]: Joi.string().required(),

  [Env.EMAIL_PORT]: Joi.number().default(587),
  [Env.EMAIL_HOST]: Joi.string(),
  [Env.EMAIL_USERNAME]: Joi.string().email().required(),
  [Env.EMAIL_PASSWORD]: Joi.string().required(),

  [Env.JWT_ACCESS_TOKEN_EXPIRES_IN]: Joi.string().default('1h'),
  [Env.JWT_REFRESH_TOKEN_EXPIRES_IN]: Joi.string().default('7d'),
  [Env.JWT_SECRET]: Joi.string().required(),

  [Env.REDIS_HOST]: Joi.string(),
  [Env.REDIS_PORT]: Joi.number(),
  [Env.REDIS_NAMESPACE]: Joi.number().default(0),

  [Env.FRONT_END_ORIGIN]: Joi.string().uri(),
});
