import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();

/** For profile avatars — 5 MB limit */
export const uploadAvatar = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/** For post images — 10 MB limit */
export const uploadPost = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/** Optimise post image before S3 upload (resize + jpeg 80%) */
export const processPostImage = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) return next();

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1000, 1000, { fit: "inside" })
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = optimizedBuffer;
    req.file.mimetype = "image/jpeg";
    next();
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    next(new Error(`Image processing failed: ${msg}`));
  }
};
