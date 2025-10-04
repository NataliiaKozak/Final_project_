// import multer, { StorageEngine } from "multer";
// import sharp from "sharp";
//для аватарки в профиле/ передаём файл, грузим в S3
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
// передаём файл дальше (загрузим его в S3 в контроллере)
const processImage = (req, res, next) => {
    if (!req.file)
        return next();
    next();
};
export { upload, processImage };
//просто принимает файл и передаёт в контроллер, 
// без обработки (файл сразу уходит в S3)
//# sourceMappingURL=uploadMiddleware.js.map