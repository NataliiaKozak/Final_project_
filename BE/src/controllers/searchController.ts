import { Request, Response } from 'express';
import User from '../models/UserModel.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';

const MAX_SEARCH_RESULTS = 20;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const searchUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const q = String(req.query?.query ?? '').trim();
    if (!q) {
      res.status(400).json({ message: 'Query cannot be empty' });
      return;
    }

    const rx = new RegExp(escapeRegExp(q), 'i');

    const users = await User.find({
      $or: [{ username: { $regex: rx } }, { fullName: { $regex: rx } }],
    })
      .select('_id username fullName profileImage')
      .limit(MAX_SEARCH_RESULTS)
      .lean();

    res.json(users);
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error searching users', error: toErrorMessage(err) });
  }
};
