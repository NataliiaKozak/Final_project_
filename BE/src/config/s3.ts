import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { ENV } from './env.js';

const S3_CACHE_CONTROL = 'public, max-age=31536000, immutable';

const s3 = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a file buffer to S3.
 * Image optimisation (sharp) is handled by the upload middleware
 * BEFORE this function is called — s3 only stores the result.
 */
export const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (!file) {
    throw new Error('File is missing');
  }

  const key = `${folder}/${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: ENV.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    CacheControl: S3_CACHE_CONTROL,
  });

  await s3.send(command);

  return `https://${ENV.S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
};
