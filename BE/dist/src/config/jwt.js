import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// console.log(crypto.randomBytes(64).toString('base64'));
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_RESET_SECRET = process.env.JWT_RESET_SECRET || 'dev_reset_secret';
const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '1d';
//  Генерация токенов
export const generateToken = (user) => {
    return jwt.sign({ user_id: user._id.toString() }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
};
// Проверка Access токена
export const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
// Reset-токен (для сброса пароля)
export const generateResetToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_RESET_SECRET, {
        expiresIn: '1h',
    });
};
// Проверка Reset-токена
export const verifyResetToken = (token) => {
    return jwt.verify(token, JWT_RESET_SECRET);
};
// 🔹 Проверка токена для Socket.io
export const verifySocketToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
//# sourceMappingURL=jwt.js.map