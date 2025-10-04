import { Request, Response } from "express";
import Subscription from "../models/SubscriptionModel.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import { createNotification } from "./notificationController.js";
import { Types } from "mongoose";

/* GET followers of userId */
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Некорректный userId" });
    }

    const followers = await Subscription.find({ following: userId }).populate(
      "follower",
      "username profile_image"
    );

    // followers: Subscription[]; each .follower is populated (document) or ObjectId
    const result = followers.map((s) =>
      (s.follower as unknown) // приведение безопаснее чем any
    );

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении подписчиков" });
  }
};

/* GET following of userId */
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Некорректный userId" });
    }

    const following = await Subscription.find({ follower: userId }).populate(
      "following",
      "username profile_image"
    );

    const result = following.map((s) => (s.following as unknown));
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при получении подписок" });
  }
};

/* followUser: follower (from token) -> follow userId (from params) */
export const followUser = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params; // target to follow
    const followerId = req.user?.id;

    if (!followerId) {
      res.status(401).json({ message: "Требуется авторизация" });
      return;
    }

    if (!Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Некорректный userId" });
      return;
    }

    if (followerId === userId) {
      res.status(400).json({ message: "Нельзя подписаться на самого себя" });
      return;
    }

    const existing = await Subscription.findOne({
      follower: followerId,
      following: userId,
    });
    if (existing) {
      res.status(400).json({ message: "Вы уже подписаны" });
      return;
    }

    const subscription = new Subscription({ follower: followerId, following: userId });
    await subscription.save();

    // уведомление — теперь просто передаём строки, внутри оно корректно создаст ObjectId
    await createNotification(String(userId), String(followerId), "followed_user");

    res.json({ message: "Подписка успешна", subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при подписке" });
  }
};

/* unfollowUser */
export const unfollowUser = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const followerId = req.user?.id;

    if (!followerId) {
      res.status(401).json({ message: "Требуется авторизация" });
      return;
    }

    const subscription = await Subscription.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!subscription) {
      res.status(400).json({ message: "Вы не подписаны на этого пользователя" });
      return;
    }

    res.json({ message: "Вы успешно отписались" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при отписке" });
  }
};
// Если у тебя есть Subscription коллекция — используй её (она уже есть у тебя).
// После добавления/удаления записи в Subscription:
// Инкремент / декремент числовых полей followers_count / following_count пользователя через $inc, либо обновляй массивы followers/following через $addToSet / $pull (если ты их хранишь).
// Пример:
// await User.findByIdAndUpdate(targetUserId, { $inc: { followers_count: 1 }, $addToSet: { followers: followerId } });
// await User.findByIdAndUpdate(followerId, { $inc: { following_count: 1 }, $addToSet: { following: targetUserId } });
