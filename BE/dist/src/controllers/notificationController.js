import { Types } from "mongoose";
import Notification from "../models/NotificationModel.js";
// Создать уведомление
export const createNotification = async (userId, senderId, type, postId, commentId) => {
    try {
        if (!Types.ObjectId.isValid(String(userId)) || !Types.ObjectId.isValid(String(senderId))) {
            console.error("createNotification: invalid userId or senderId");
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
        return notificationDoc;
    }
    catch (error) { //добавить unknown?
        // const error = err as Error; //добавить?
        console.error("Ошибка при создании уведомления:", error);
        return;
    }
};
// Получить уведомления пользователя
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: "Неавторизовано" });
        const notifications = await Notification.find({ user: userId })
            .populate("sender", "username avatar")
            .populate("post", "image description")
            .populate("comment", "text")
            .sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (err) {
        const error = err;
        res.status(500).json({ message: "Ошибка", error: error.message });
    }
};
// Отметить все как прочитанные
export const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Неавторизованный доступ" });
            return;
        }
        const unread = await Notification.countDocuments({ user: req.user.id, isRead: false });
        if (unread === 0) {
            res.status(200).json({ message: "У вас нет непрочитанных уведомлений" });
            return;
        }
        await Notification.updateMany({ user: req.user.id, isRead: false }, { $set: { isRead: true } });
        res.json({ message: "Все уведомления отмечены как прочитанные" });
    }
    catch (err) { //нужно было добавить unknown?
        const error = err; //нужно было добавить?
        console.error("Ошибка при обновлении уведомлений:", error);
        res.status(500).json({ message: "Ошибка при обновлении уведомлений", error });
    }
};
//# sourceMappingURL=notificationController.js.map