import { Request, Response } from "express";
import Follow from "../models/FollowModel.js";
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

    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username profileImage"
    );

    const result = followers.map((s) =>
      (s.follower as unknown)
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

    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username profileImage"
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
    const { userId } = req.params; 
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

    const existing = await Follow.findOne({
      follower: followerId,
      following: userId,
    });
    if (existing) {
      res.status(400).json({ message: "Вы уже подписаны" });
      return;
    }

    const follow = new Follow({ follower: followerId, following: userId });
    await follow.save();

    // уведомление — теперь просто передаём строки, внутри оно корректно создаст ObjectId
    await createNotification(String(userId), String(followerId), "followed_user");

    res.json({ message: "Подписка успешна", follow });
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

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: userId,
    });

    if (!follow) {
      res.status(400).json({ message: "Вы не подписаны на этого пользователя" });
      return;
    }

    res.json({ message: "Вы успешно отписались" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка при отписке" });
  }
};

