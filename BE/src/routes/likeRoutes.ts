import { Router } from "express";
import { toggleLike, getPostLikes, getCommentLikes, toggleLikeComment } from "../controllers/likeController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

// лайки постов
// /api/likes/post/:postId
router.post("/post/:postId", protect, toggleLike);
router.get("/post/:postId", getPostLikes);

// лайки комментариев
// /api/likes/comment/:commentId
router.post("/comment/:commentId", protect, toggleLikeComment);
router.get("/comment/:commentId", getCommentLikes);

export default router;

