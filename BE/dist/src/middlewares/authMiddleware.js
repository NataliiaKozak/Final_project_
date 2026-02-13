import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';
//  Middleware для защиты роутов.  
export const protect = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
        return;
    }
    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.user_id };
        next();
    }
    catch {
        res.status(401).json({ message: 'Неверный или истекший токен' });
    }
};
//# sourceMappingURL=authMiddleware.js.map