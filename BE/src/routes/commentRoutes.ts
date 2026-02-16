import { Router } from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { addCommentSchema } from "../validation/commonSchemas.js";

const router = Router();

// /api/comments/post/:postId  → получить комментарии поста
router.get("/post/:postId", getPostComments);

// /api/comments/:postId → добавить комментарий
router.post("/:postId", protect, validate(addCommentSchema), addComment);

// /api/comments/:commentId → удалить комментарий
router.delete("/:commentId", protect, deleteComment);

export default router;


/**
 * /api/comments/post/:postId → получить комментарии к посту
 * /api/comments/:postId → добавить комментарий (только авторизованный пользователь)
 * /api/comments/:commentId → удалить комментарий (только автор)
 */
