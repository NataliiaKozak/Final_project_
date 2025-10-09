import { Request, Response } from 'express';
import User from '../models/UserModel.js';

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Забираем query строго как строку
    const raw = req.query.query;
    const q = String(req.query?.query ?? '').trim();
    if (!q.trim()) {
      res.status(400).json({ message: 'Запрос не может быть пустым' });
      return;
    }

    // Экраним спецсимволы, чтобы не ловить "Invalid regular expression"
    const rx = new RegExp(escapeRegExp(q.trim()), 'i');

    const users = await User.find({
      $or: [{ username: { $regex: rx } }, { fullName: { $regex: rx } }],
    })
      .select('_id username fullName profileImage')
      .limit(20)
      .lean(); // быстрее, без лишних Mongoose-объектов

    res.json(users);
  } catch (error: any) {
    console.error('[searchUsers] error:', error);
    res.status(500).json({
      message: 'Ошибка при поиске пользователей',
      error: error?.message,
    });
  }
};
