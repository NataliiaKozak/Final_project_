//для картинок постов
import multer from "multer";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Сжимаем и уменьшаем перед загрузкой в S3
const processImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return next();

    const optimizedBuffer = await sharp(req.file.buffer)
      .resize(1000, 1000, { fit: "inside" }) // уменьшаем до 1000px
      .jpeg({ quality: 80 })
      .toBuffer();

    req.file.buffer = optimizedBuffer; // заменяем на оптимизированный буфер
    req.file.mimetype = "image/jpeg"; // указываем новый формат
    next();
  } catch (error) {
    console.error("Ошибка при обработке изображения:", error);
    res.status(500).json({ message: "Ошибка обработки изображения" });
  }
};

export { upload, processImage };


