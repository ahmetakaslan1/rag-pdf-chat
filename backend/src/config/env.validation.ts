import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  FRONTEND_URL: Joi.string().required(),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),

  STORAGE_TYPE: Joi.string().valid('local', 's3').default('local'),
  LOCAL_UPLOAD_DIR: Joi.string().default('./uploads'),
  LOCAL_BASE_URL: Joi.string().default('http://localhost:3000'),

  S3_BUCKET_NAME: Joi.string().optional(),
  S3_REGION: Joi.string().optional(),
  S3_ACCESS_KEY: Joi.string().optional(),
  S3_SECRET_KEY: Joi.string().optional(),

  GEMINI_API_KEY: Joi.string().required(),
  GEMINI_EMBEDDING_MODEL: Joi.string().default('gemini-embedding-2'),
  GEMINI_CHAT_MODEL: Joi.string().default('gemini-2.5-flash'),

  THROTTLE_TTL: Joi.number().default(3600),
  THROTTLE_LIMIT: Joi.number().default(3),
});
