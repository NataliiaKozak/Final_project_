import { Router } from "express";
import { getMessages, sendMessage, getAllConversations } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Загрузить историю чата между пользователями
// GET /api/messages/:userId
// POST /api/messages — отправить сообщение
router.post("/", protect, sendMessage);

// GET /api/messages — все диалоги текущего пользователя
router.get("/", protect, getAllConversations);

// GET /api/messages/:userId — история чата с конкретным пользователем
router.get("/:userId", protect, getMessages);

export default router;
