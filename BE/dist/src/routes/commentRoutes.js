import { Router } from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = Router();
// /api/comments/post/:postId  → получить комментарии поста
router.get("/post/:postId", getPostComments);
// /api/comments/:postId → добавить комментарий
router.post("/:postId", protect, addComment);
// /api/comments/:commentId → удалить комментарий
router.delete("/:commentId", protect, deleteComment);
export default router;
/**
 * /api/comments/post/:postId → получить комментарии к посту
 * /api/comments/:postId → добавить комментарий (только авторизованный пользователь)
 * /api/comments/:commentId → удалить комментарий (только автор)
 */
//# sourceMappingURL=commentRoutes.js.map