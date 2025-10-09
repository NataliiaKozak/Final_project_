import { Router } from "express";
import { getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// Загрузить историю чата между пользователями
// GET /api/messages/:userId
router.get("/:userId", protect, getMessages);

export default router;
