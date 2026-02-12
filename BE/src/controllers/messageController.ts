import { Request, Response } from "express";
import { Types } from "mongoose";
import Message from "../models/MessageModel.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";

// Отправить сообщение
export const sendMessage = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }

    const { recipientId, text } = req.body;

    if (!recipientId || !text?.trim()) {
      res.status(400).json({ message: "recipientId и text обязательны" });
      return;
    }

    if (recipientId === currentUserId) {
      res.status(400).json({ message: "Нельзя отправить сообщение самому себе" });
      return;
    }

    const message = new Message({
      sender: new Types.ObjectId(currentUserId),
      recipient: new Types.ObjectId(recipientId),
      text: text.trim(),
    });

    await message.save();

    const populated = await message.populate([
      { path: "sender", select: "username profileImage" },
      { path: "recipient", select: "username profileImage" },
    ]);

    res.status(201).json(populated);
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Ошибка при отправке сообщения:", error);
    res.status(500).json({ message: "Ошибка при отправке сообщения", error: error.message });
  }
};

// Получить все диалоги текущего пользователя (список собеседников)
export const getAllConversations = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { recipient: currentUserId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "username profileImage")
      .populate("recipient", "username profileImage");

    res.json(messages);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: "Ошибка при загрузке диалогов", error: error.message });
  }
};

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
