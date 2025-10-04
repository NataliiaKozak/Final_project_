// import { Router } from "express";
// import { getMessages } from "../controllers/messageController";
// import { protect } from "../middlewares/authMiddleware";

// const router = Router();

// // /api/messages/:targetUserId → получить историю чата
// router.get("/:targetUserId", protect, getMessages);

// export default router;

import { Router } from "express";
import { getMessages } from "../controllers/messageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

// 🔹 Загрузить историю чата между пользователями
// GET /api/messages/:userId
router.get("/:userId", protect, getMessages);

export default router;
