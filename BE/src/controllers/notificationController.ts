import { Response } from 'express';
import { Types } from 'mongoose';
import Notification from '../models/NotificationModel.js';
import { RequestWithUser } from '../middlewares/authMiddleware.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';
import logger from '../config/logger.js';

type NotificationType = 'liked_post' | 'liked_comment' | 'commented_post' | 'followed_user';

// Create notification
export const createNotification = async (
  userId: string | Types.ObjectId,
  senderId: string | Types.ObjectId,
  type: NotificationType,
  postId?: string | Types.ObjectId,
  commentId?: string | Types.ObjectId,
): Promise<void> => {
  try {
    if (
      !Types.ObjectId.isValid(String(userId)) ||
      !Types.ObjectId.isValid(String(senderId))
    ) {
      return;
    }

    const notificationDoc = new Notification({
      user: new Types.ObjectId(String(userId)),
      sender: new Types.ObjectId(String(senderId)),
      type,
      post: postId ? new Types.ObjectId(String(postId)) : undefined,
      comment: commentId ? new Types.ObjectId(String(commentId)) : undefined,
      isRead: false,
    });

    await notificationDoc.save();
  } catch (err: unknown) {
    logger.error('Error creating notification:', { error: toErrorMessage(err) });
  }
};

// Get user notifications
export const getNotifications = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find({ user: userId })
        .populate('sender', 'username profileImage')
        .populate('post', 'image description')
        .populate('comment', 'text')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: userId }),
    ]);

    res.json({ notifications, total, page, pages: Math.ceil(total / limit) });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error fetching notifications', error: toErrorMessage(err) });
  }
};

// Mark all as read
export const markAsRead = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const unread = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });
    if (unread === 0) {
      res.status(200).json({ message: 'No unread notifications' });
      return;
    }

    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } },
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error updating notifications', error: toErrorMessage(err) });
  }
};

// Mark one as read
export const markOneAsRead = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { $set: { isRead: true } },
      { new: true },
    );
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    res.json(notification);
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error updating notification', error: toErrorMessage(err) });
  }
};
