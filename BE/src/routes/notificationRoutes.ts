import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", protect, getNotifications);
router.put("/read", protect, markAsRead);

export default router;
