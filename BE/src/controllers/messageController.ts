import { Response } from "express";
import { Types } from "mongoose";
import Message from "../models/MessageModel.js";
import { RequestWithUser } from "../middlewares/authMiddleware.js";
import { toErrorMessage } from "../utils/toErrorMessage.js";

// Send message
export const sendMessage = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { recipientId, text } = req.body;

    if (!recipientId || !text?.trim()) {
      res.status(400).json({ message: "recipientId and text are required" });
      return;
    }

    if (recipientId === currentUserId) {
      res.status(400).json({ message: "Cannot send message to yourself" });
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
    res.status(500).json({ message: "Error sending message", error: toErrorMessage(err) });
  }
};

// Get all conversations
export const getAllConversations = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      res.status(401).json({ message: "Unauthorized" });
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
    res.status(500).json({ message: "Error fetching conversations", error: toErrorMessage(err) });
  }
};

// Get message history between two users
export const getMessages = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id;

    if (!currentUserId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;

    const filter = {
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
    };

    const [messages, total] = await Promise.all([
      Message.find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "username profileImage")
        .populate("recipient", "username profileImage"),
      Message.countDocuments(filter),
    ]);

    res.json({ messages, total, page, pages: Math.ceil(total / limit) });
  } catch (err: unknown) {
    res.status(500).json({ message: "Error fetching messages", error: toErrorMessage(err) });
  }
};
