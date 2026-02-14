import { Request, Response } from 'express';
import Like from '../models/LikeModel.js';
import Post from '../models/PostModel.js';
import Comment from '../models/CommentModel.js';
import { RequestWithUser } from '../middlewares/authMiddleware.js';
import { createNotification } from './notificationController.js';
import { toErrorMessage } from '../utils/toErrorMessage.js';

function getPopulatedId(field: unknown): string {
  if (typeof field === 'object' && field !== null && '_id' in field) {
    return String((field as { _id: unknown })._id);
  }
  return String(field);
}

// ===================== Toggle post like =================================
export const toggleLike = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const post = await Post.findById(postId).populate('author');
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
      return;
    }

    const deleted = await Like.findOneAndDelete({ user: userId, post: postId });

    if (deleted) {
      await Post.findByIdAndUpdate(postId, { $pull: { likes: deleted._id } });
      const likesCount = await Like.countDocuments({ post: postId });
      res.json({ liked: false, likesCount });
      return;
    }

    const like = new Like({ user: userId, post: postId });
    await like.save();
    await Post.findByIdAndUpdate(postId, { $addToSet: { likes: like._id } });

    const postAuthorId = getPopulatedId(post.author);
    if (postAuthorId !== userId) {
      await createNotification(postAuthorId, userId, 'liked_post', post._id);
    }

    const likesCount = await Like.countDocuments({ post: postId });
    res.json({ liked: true, likesCount });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error toggling like', error: toErrorMessage(err) });
  }
};

// ==================== Get post likes =========================
export const getPostLikes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { postId } = req.params;
    const likes = await Like.find({ post: postId }).populate('user', 'username profileImage');
    res.json(likes);
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error fetching likes', error: toErrorMessage(err) });
  }
};

// =================== Toggle comment like ===============================
export const toggleLikeComment = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const comment = await Comment.findById(commentId).populate('user', '_id username profileImage');
    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    const deleted = await Like.findOneAndDelete({ user: userId, comment: commentId });

    if (deleted) {
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
      const likesCount = await Like.countDocuments({ comment: commentId });
      res.json({ liked: false, likesCount });
      return;
    }

    const like = new Like({ user: userId, comment: commentId });
    await like.save();

    await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });

    const commentAuthorId = getPopulatedId(comment.user);
    if (commentAuthorId !== userId) {
      await createNotification(commentAuthorId, userId, 'liked_comment', undefined, comment._id);
    }

    const likesCount = await Like.countDocuments({ comment: commentId });
    res.json({ liked: true, likesCount });
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error toggling comment like', error: toErrorMessage(err) });
  }
};

// ================ Get comment likes =======================
export const getCommentLikes = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const likes = await Like.find({ comment: commentId }).populate('user', 'username profileImage');
    res.json(likes);
  } catch (err: unknown) {
    res.status(500).json({ message: 'Error fetching comment likes', error: toErrorMessage(err) });
  }
};
