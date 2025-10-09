import crypto from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Types } from 'mongoose';

dotenv.config();

// console.log(crypto.randomBytes(64).toString('base64'));

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'dev_secret';
const JWT_RESET_SECRET: Secret =
  process.env.JWT_RESET_SECRET || 'dev_reset_secret';
const JWT_ACCESS_EXPIRES: string = process.env.JWT_ACCESS_EXPIRES || '1d';

//  Типы - содержать строковое поле user_id
export interface JwtPayload {
  user_id: string;
}

//  Генерация токенов
export const generateToken = (user: { _id: Types.ObjectId }) => {
  return jwt.sign(
    { user_id: user._id.toString() },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES } as SignOptions
  );
};

// Проверка Access токена
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

// Reset-токен (для сброса пароля)
export const generateResetToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_RESET_SECRET, {
    expiresIn: '1h',
  } as SignOptions);
};

// Проверка Reset-токена
export const verifyResetToken = (token: string): { id: string } => {
  return jwt.verify(token, JWT_RESET_SECRET) as { id: string };
};

// 🔹 Проверка токена для Socket.io
export const verifySocketToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
