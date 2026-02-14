import { Request, Response } from 'express';
import User, { IUser } from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import { sendResetPasswordEmail } from '../utils/mailer.js';
import {
  generateToken,
  generateResetToken,
  verifyResetToken,
} from '../config/jwt.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';

const MIN_PASSWORD_LENGTH = 6;

interface UserPublicDto {
  _id: unknown;
  username: string;
  email: string;
  fullName: string;
  profileImage: string;
}

function toUserPublic(user: IUser): UserPublicDto {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    fullName: user.fullName,
    profileImage: user.profileImage || '',
  };
}

// =================== REGISTER ===================
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { username, email, password, fullName } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    if (!password || password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      return;
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      const errors: Record<string, string> = {};
      if (existing.email === email) errors.email = 'Email is already taken';
      if (existing.username === username) errors.username = 'Username is already taken';
      res.status(400).json({ errors });
      return;
    }

    const newUser = new User({ username, email, password, fullName });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ token, user: toUserPublic(newUser) });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Server error during registration', error: toErrorMessage(err) });
  }
};

// =================== LOGIN ===================
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      res.status(400).json({ message: 'Credentials are required' });
      return;
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).select('+password');

    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user);
    res.status(200).json({ token, user: toUserPublic(user) });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Server error during login', error: toErrorMessage(err) });
  }
};

// =================== FORGOT PASSWORD ===================
export const requestPasswordReset = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ message: 'Invalid email format' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'User not found' });
      return;
    }

    const token = generateResetToken(user._id.toString());

    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV] reset token:', token);
    }

    await sendResetPasswordEmail(email, token);

    if (process.env.NODE_ENV !== 'production') {
      res.json({ message: 'Password reset link sent to email', token });
      return;
    }

    res.json({ message: 'Password reset link sent to email' });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error requesting password reset', error: toErrorMessage(err) });
  }
};

// =================== RESET PASSWORD ===================
export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ message: 'Token and new password are required' });
      return;
    }

    const decoded = verifyResetToken(token);
    if (!decoded) {
      res.status(400).json({ message: 'Invalid or expired token' });
      return;
    }

    const user = await User.findById<IUser>(decoded.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error resetting password', error: toErrorMessage(err) });
  }
};
