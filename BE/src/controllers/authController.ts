import { Request, Response } from 'express';
import User, { IUser } from '../models/UserModel.js';
import bcrypt from 'bcrypt'; 
import dotenv from 'dotenv';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import {
  generateToken,
  generateResetToken,
  verifyResetToken,
} from '../config/jwt.js';

dotenv.config();

// =================== REGISTER ===================
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password, fullName } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const errors: Record<string, string> = {};
      if (existing.email === email) errors.email = 'Email уже используется';
      if (existing.username === username)
        errors.username = 'Username уже используется';
      res.status(400).json({ errors });
      return;
    }

    // NOTE: в модели User должен быть pre('save') для хеширования пароля.
    const newUser = new User({ username, email, password, fullName });
    await newUser.save();

    // Генерируем токен (в теле ответа — т.к. ты хочешь хранить в localStorage)
    const token = generateToken(newUser);

    // Возвращаем минимальные данные пользователя (без пароля)//добавлено
    const userPublic = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      profileImage: newUser.profileImage || '',
    };

    res.status(201).json({ token, user: userPublic });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      message: 'Ошибка сервера при регистрации',
      error: error.message,
    });
  }
};

// =================== LOGIN ===================
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // поле emailOrUsername
      const { emailOrUsername, password } = req.body as {
      emailOrUsername: string;
      password: string;
    };
    const user = await User.findOne({
  $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
}).select('+password'); //после проверки в постманн про пароль при put

    if (!user) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    // переносим логику проверки пароля в модель
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      res.status(400).json({ message: 'Неверные учетные данные' });
      return;
    }

    const token = generateToken(user);

    const userPublic = {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profileImage: user.profileImage || '',
    };

    res.status(200).json({ token, user: userPublic });
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка сервера при логине', error: error.message });
  }
};

// =================== FORGOT password)  ===================
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email обязателен' });
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const token = generateResetToken(user._id.toString());

    // показываем токен в DEV
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] reset token:', token);
    }

    // Отправляем письмо — в prod не возвращаем токен в ответе
    await sendResetPasswordEmail(email, token);

// в DEV отдаем токен в ответе (чтобы удобно скопировать в Postman)
    if (process.env.NODE_ENV !== 'production') {
      return res.json({
        message: 'Ссылка для сброса пароля отправлена на email',
        token,
      });
    }

    // PROD-ответ без токена
    res.json({ message: 'Ссылка для сброса пароля отправлена на email' });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      message: 'Ошибка при запросе сброса пароля',
      error: error.message,
    });
  }
};


// =================== RESET PASSWORD ===================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: 'Недостаточно данных' });

    // валидируем токен сброса
    const decoded = verifyResetToken(token) as { id: string } | null;
    if (!decoded || !decoded.id) {
      return res
        .status(400)
        .json({ message: 'Некорректный или просроченный токен' });
    }

    const user = await User.findById<IUser>(decoded.id); //дженерик
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    // Присваиваем новый пароль — pre('save') в модели хеширует его
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Пароль успешно обновлён' });
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при сбросе пароля', error: error.message });
  }
};
