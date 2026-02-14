import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt.js';

export interface RequestWithUser extends Request {
  user?: { id: string };
}

export const protect = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token, authorization denied' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const decoded: JwtPayload = verifyToken(token);
    req.user = { id: decoded.user_id };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
