import { Request, Response } from 'express';
import Like from '../models/LikeModel.js';
import Post from '../models/PostModel.js';
import Comment from '../models/CommentModel.js';
import { RequestWithUser } from '../middlewares/authMiddleware.js';
import { createNotification } from './notificationController.js';

//===================== Лайк поста=================================
export const toggleLike = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    const post = await Post.findById(postId).populate('author');
    if (!post) {
      res.status(404).json({ message: 'Пост не найден' });
      return;
    }

    const deleted = await Like.findOneAndDelete({ user: userId, post: postId });

    if (deleted) {
      const likesCount = await Like.countDocuments({ post: postId });
      res.json({ liked: false, likesCount });
      return;
    }

    const like = new Like({ user: userId, post: postId });
    await like.save();

    //Уведомление автору поста
    if (post.author && post.author._id.toString() !== userId) {
      await createNotification(post.author._id, userId, 'liked_post', post._id);
    }

    const likesCount = await Like.countDocuments({ post: postId });
    res.json({ liked: true, likesCount });
  } catch (error) {
    console.error('Ошибка при изменении лайка:', error);
    res.status(500).json({ message: 'Ошибка при изменении лайка' });
  }
};

//Дополнительная функциональность. 
// ====================Получить лайки поста=========================
// export const getPostLikes = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { postId } = req.params;
//     const likes = await Like.find({ post: postId }).populate(
//       'user',
//       'username profileImage'
//     );
//     res.json(likes);
//   } catch (error) {
//     console.error('Ошибка при получении лайков:', error);
//     res.status(500).json({ message: 'Ошибка при получении лайков' });
//   }
// };

// ===================Лайк комментария===============================
export const toggleLikeComment = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Пользователь не авторизован' });
      return;
    }

    const comment = await Comment.findById(commentId).populate("user", "_id username profileImage");
    if (!comment) {
      res.status(404).json({ message: "Комментарий не найден" });
      return;
    }

    const deleted = await Like.findOneAndDelete({
      user: userId,
      comment: commentId,
    });

    if (deleted) {
      await Comment.findByIdAndUpdate(commentId, { $pull: { likes: userId } });
      const likesCount = await Like.countDocuments({ comment: commentId });
      res.json({ liked: false, likesCount });
      return;
    }

    const like = new Like({ user: userId, comment: commentId });
    await like.save();

    await Comment.findByIdAndUpdate(commentId, { $addToSet: { likes: userId } });

    if (comment.user && comment.user.toString() !== userId) {
      await createNotification(comment.user, userId, "liked_comment", undefined, comment._id);
    }

    const likesCount = await Like.countDocuments({ comment: commentId });
    res.json({ liked: true, likesCount });
  } catch (error) {
    console.error('Ошибка при изменении лайка комментария:', error);
    res.status(500).json({ message: 'Ошибка при изменении лайка комментария' });
  }
};


// ================Получить лайки комментария=======================
// export const getCommentLikes = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { commentId } = req.params;
//     const likes = await Like.find({ comment: commentId }).populate(
//       'user',
//       'username profileImage'
//     );
//     res.json(likes);
//   } catch (error) {
//     console.error('Ошибка при получении лайков комментария:', error);
//     res
//       .status(500)
//       .json({ message: 'Ошибка при получении лайков комментария' });
//   }
// };
