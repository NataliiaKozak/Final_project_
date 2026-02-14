import jwt, { Secret, SignOptions, JwtPayload as JwtLibPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { ENV } from './env.js';

export interface JwtPayload {
  user_id: string;
}

interface ResetPayload {
  id: string;
}

function isJwtPayload(decoded: string | JwtLibPayload): decoded is JwtLibPayload & JwtPayload {
  return typeof decoded === 'object' && decoded !== null && 'user_id' in decoded;
}

function isResetPayload(decoded: string | JwtLibPayload): decoded is JwtLibPayload & ResetPayload {
  return typeof decoded === 'object' && decoded !== null && 'id' in decoded;
}

export const generateToken = (user: { _id: Types.ObjectId }): string => {
  return jwt.sign(
    { user_id: user._id.toString() },
    ENV.JWT_SECRET as Secret,
    { expiresIn: ENV.JWT_ACCESS_EXPIRES } as SignOptions,
  );
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, ENV.JWT_SECRET as Secret);
  if (!isJwtPayload(decoded)) {
    throw new Error('Invalid token payload: missing user_id');
  }
  return { user_id: decoded.user_id };
};

export const generateResetToken = (userId: string): string => {
  return jwt.sign({ id: userId }, ENV.JWT_RESET_SECRET as Secret, {
    expiresIn: '1h',
  } as SignOptions);
};

export const verifyResetToken = (token: string): ResetPayload => {
  const decoded = jwt.verify(token, ENV.JWT_RESET_SECRET as Secret);
  if (!isResetPayload(decoded)) {
    throw new Error('Invalid reset token payload: missing id');
  }
  return { id: decoded.id };
};

export const verifySocketToken = (token: string): JwtPayload => {
  return verifyToken(token);
};
