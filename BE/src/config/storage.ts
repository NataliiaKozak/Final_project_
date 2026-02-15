import { ENV } from './env.js';
import { uploadToS3 } from './s3.js';
import { uploadToCloudinary } from './cloudinary.js';

/**
 * Unified upload function.
 * Delegates to S3 or Cloudinary based on STORAGE_PROVIDER env variable.
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  if (ENV.STORAGE_PROVIDER === 'cloudinary') {
    return uploadToCloudinary(file, folder);
  }
  return uploadToS3(file, folder);
};
