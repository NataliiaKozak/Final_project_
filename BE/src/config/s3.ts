import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { ENV } from './env.js';

const s3 = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string): Promise<string> => {
  if (!file) {
    throw new Error('Файл отсутствует');
  }

  const processedImage = await sharp(file.buffer)
    .resize({ width: 1080, withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  const key = `${folder}/${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`;

  const command = new PutObjectCommand({
    Bucket: ENV.S3_BUCKET_NAME,
    Key: key,
    Body: processedImage,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=31536000, immutable',
  });

  await s3.send(command);

  return `https://${ENV.S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;
};
