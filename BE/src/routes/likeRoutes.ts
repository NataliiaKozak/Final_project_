import { Router } from 'express';
// import { toggleLike, getPostLikes, getCommentLikes, toggleLikeComment } from "../controllers/likeController"; опционально
import { toggleLike, toggleLikeComment } from '../controllers/likeController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// лайки постов
// /api/likes/post/:postId
router.post('/post/:postId', protect, toggleLike);
// router.get("/post/:postId", getPostLikes); опционально

// лайки комментариев
// /api/likes/comment/:commentId
router.post('/comment/:commentId', protect, toggleLikeComment);
// router.get("/comment/:commentId", getCommentLikes); опционально

export default router;

/**
 * Лайки
 * /api/likes/post/:postId → лайк/анлайк поста
 * /api/likes/comment/:commentId → лайк/анлайк комментария, уведомления идут автору (comment.user).
 * GET-запросы возвращают список лайков
 */
