import { Request, Response } from "express";
import Message from "../models/MessageModel.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";

// Получить историю сообщений между двумя пользователями
export const getMessages = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;      // второй участник
    const currentUserId = req.user?.id; // текущий (из токена)

    if (!currentUserId) {
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profileImage")
      .populate("recipient", "username profileImage");

    res.json(messages);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Ошибка при загрузке сообщений:", error);
    res.status(500).json({ message: "Ошибка при загрузке сообщений", error: error.message });
  }
};
