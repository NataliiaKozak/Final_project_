import { v2 as cloudinary } from 'cloudinary';
import { ENV } from './env.js';

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  if (!file) {
    throw new Error('File is missing');
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `ichgramm/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary returned no result'));
        resolve(result.secure_url);
      },
    );
    stream.end(file.buffer);
  });
};
