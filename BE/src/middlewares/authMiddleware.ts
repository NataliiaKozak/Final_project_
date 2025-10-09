import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JwtPayload } from '../config/jwt.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

//  Расширяем Request (добавляем user после аутентификации)
export interface RequestWithUser extends Request {
  user?: { id: string };
}

//  Middleware для защиты роутов.  
export const protect = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): void => {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Нет токена, авторизация отклонена' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = { id: decoded.user_id };
    next();
  } catch {
    res.status(401).json({ message: 'Неверный или истекший токен' });
  }
};

