import { verifyToken } from '../config/jwt.js';
export const protect = (req, res, next) => {
    const header = req.header('Authorization');
    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token, authorization denied' });
        return;
    }
    try {
        const token = header.split(' ')[1];
        const decoded = verifyToken(token);
        req.user = { id: decoded.user_id };
        next();
    }
    catch {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};
//# sourceMappingURL=authMiddleware.js.map