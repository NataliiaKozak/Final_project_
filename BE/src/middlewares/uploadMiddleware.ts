//для аватарки в профиле

import multer from "multer";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// загрузка
const processImage = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  next();
};

export { upload, processImage };

