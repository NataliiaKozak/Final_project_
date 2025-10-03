import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid'; //случайный уникальный идентификатор
import sharp from 'sharp';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (file: Express.Multer.File, folder: string) => {
  if (!file) {
    throw new Error('Файл отсутствует');
  }
  //  обрабатываем изображение перед загрузкой
  const processedImage = await sharp(file.buffer)
    // .resize(1080) // ширина макс. 1080px
    .resize({ width: 1080, withoutEnlargement: true }) // не увеличиваем, если фото меньше
    .jpeg({ quality: 80 }) // конвертируем в JPEG с 80% качеством
    .toBuffer();

  // const key = `${folder}/${uuidv4()}-${file.originalname}`;
  const key = `${folder}/${uuidv4()}-${file.originalname.replace(/\s+/g, '_')}`; //убирает пробелы

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: key,
    // Body: file.buffer,
    Body: processedImage, // загружаем обработанный файл
    // ContentType: file.mimetype,
    ContentType: 'image/jpeg',
    ACL: 'public-read', //чтобы файл был доступен по URL/можно убрать и настроить bucket policy
  });

  await s3.send(command);

  return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
