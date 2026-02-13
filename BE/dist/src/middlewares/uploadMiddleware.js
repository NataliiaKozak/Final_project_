//для аватарки в профиле
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB
// загрузка
const processImage = (req, res, next) => {
    if (!req.file)
        return next();
    next();
};
export { upload, processImage };
//# sourceMappingURL=uploadMiddleware.js.map