import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/** Returns env value or empty string if not set (for optional provider keys) */
function optionalEnv(key: string): string {
  return process.env[key] || '';
}

const STORAGE_PROVIDER = (process.env.STORAGE_PROVIDER || 's3') as 's3' | 'cloudinary';

export const ENV = {
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: requireEnv('MONGO_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_RESET_SECRET: requireEnv('JWT_RESET_SECRET'),
  JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '1d',

  // Storage provider selection
  STORAGE_PROVIDER,

  // AWS S3 (required only when STORAGE_PROVIDER=s3)
  AWS_REGION: optionalEnv('AWS_REGION'),
  AWS_ACCESS_KEY_ID: optionalEnv('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optionalEnv('AWS_SECRET_ACCESS_KEY'),
  S3_BUCKET_NAME: optionalEnv('S3_BUCKET_NAME'),

  // Cloudinary (required only when STORAGE_PROVIDER=cloudinary)
  CLOUDINARY_CLOUD_NAME: optionalEnv('CLOUDINARY_CLOUD_NAME'),
  CLOUDINARY_API_KEY: optionalEnv('CLOUDINARY_API_KEY'),
  CLOUDINARY_API_SECRET: optionalEnv('CLOUDINARY_API_SECRET'),

  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
} as const;
