import { Router } from "express";
import { getNotifications, markAsRead, markOneAsRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();
router.get("/", protect, getNotifications);
router.put("/read", protect, markAsRead);
router.patch("/:id", protect, markOneAsRead);
export default router;
//# sourceMappingURL=notificationRoutes.js.map