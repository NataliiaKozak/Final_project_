import jwt from 'jsonwebtoken';
import { ENV } from './env.js';
function isJwtPayload(decoded) {
    return typeof decoded === 'object' && decoded !== null && 'user_id' in decoded;
}
function isResetPayload(decoded) {
    return typeof decoded === 'object' && decoded !== null && 'id' in decoded;
}
export const generateToken = (user) => {
    return jwt.sign({ user_id: user._id.toString() }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_ACCESS_EXPIRES });
};
export const verifyToken = (token) => {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!isJwtPayload(decoded)) {
        throw new Error('Invalid token payload: missing user_id');
    }
    return { user_id: decoded.user_id };
};
export const generateResetToken = (userId) => {
    return jwt.sign({ id: userId }, ENV.JWT_RESET_SECRET, {
        expiresIn: '1h',
    });
};
export const verifyResetToken = (token) => {
    const decoded = jwt.verify(token, ENV.JWT_RESET_SECRET);
    if (!isResetPayload(decoded)) {
        throw new Error('Invalid reset token payload: missing id');
    }
    return { id: decoded.id };
};
export const verifySocketToken = (token) => {
    return verifyToken(token);
};
//# sourceMappingURL=jwt.js.map