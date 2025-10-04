// import { Request, Response } from "express";
// import Message from "../models/MessageModel";
// import { RequestWithUser } from "../middlewares/authMiddleware";
import Message from "../models/MessageModel.js";
// 🔹 Получить историю сообщений между двумя пользователями
export const getMessages = async (req, res) => {
    try {
        const { userId } = req.params; // второй участник
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
            .populate("sender", "username profile_image")
            .populate("recipient", "username profile_image");
        res.json(messages);
    }
    catch (err) {
        const error = err;
        console.error("Ошибка при загрузке сообщений:", error);
        res.status(500).json({ message: "Ошибка при загрузке сообщений", error: error.message });
    }
};
//# sourceMappingURL=messageController.js.map