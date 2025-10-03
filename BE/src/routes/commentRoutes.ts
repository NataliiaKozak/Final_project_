import { Router } from "express";
import { addComment, deleteComment, getPostComments } from "../controllers/commentController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// /api/comments/post/:postId  → получить комментарии поста
router.get("/post/:postId", getPostComments);

// /api/comments/:postId → добавить комментарий
router.post("/:postId", protect, addComment);

// /api/comments/:commentId → удалить комментарий
router.delete("/:commentId", protect, deleteComment);

export default router;
