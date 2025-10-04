import { Request, Response } from 'express';
import Like from '../models/LikeModel';
import Post from '../models/PostModel';
import Comment from '../models/CommentModel';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { createNotification } from './notificationController';

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

    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (existingLike) {
      await existingLike.deleteOne();
      res.json({ message: 'Лайк удалён' });
      return;
    }

    const like = new Like({ user: userId, post: postId });
    await like.save();

    //Уведомление автору поста
    if (post.author && post.author._id.toString() !== userId) {
      await createNotification(post.author._id, userId, 'liked_post', post._id);
    }

    res.json({ message: 'Лайк добавлен', like });
  } catch (error) {
    console.error('Ошибка при изменении лайка:', error);
    res.status(500).json({ message: 'Ошибка при изменении лайка' });
  }
};

//Дополнительная функциональность. По макету не требуется
// ====================Получить лайки поста=========================?????
// export const getPostLikes = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { postId } = req.params;
//     const likes = await Like.find({ post: postId }).populate(
//       'user',
//       'username profile_image'
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

    //в связи с удалением автора
    // const comment = await Comment.findById(commentId).populate("author");
    // const comment = await Comment.findById(commentId).populate(
    //   'author',
    //   '_id username profile_image'
    // );
    // if (!comment) {
    //   res.status(404).json({ message: 'Комментарий не найден' });
    //   return;
    // }
    const comment = await Comment.findById(commentId).populate("user", "_id username profile_image");
    if (!comment) {
      res.status(404).json({ message: "Комментарий не найден" });
      return;
    }

    const existingLike = await Like.findOne({
      user: userId,
      comment: commentId,
    });

    if (existingLike) {
      await existingLike.deleteOne();
      res.json({ message: 'Лайк комментария удалён' });
      return;
    }

    const like = new Like({ user: userId, comment: commentId });
    await like.save();

    // Уведомление теперь автору комментария (comment.user), а не "author"
    // if (comment.author && comment.author.toString() !== userId) {
    //   await createNotification(
    //     comment.author,
    //     userId,
    //     'liked_comment',
    //     undefined,
    //     comment._id
    //   );
    // }
    if (comment.user && comment.user.toString() !== userId) {
      await createNotification(comment.user, userId, "liked_comment", undefined, comment._id);
    }


    res.json({ message: 'Лайк комментария добавлен', like });
  } catch (error) {
    console.error('Ошибка при изменении лайка комментария:', error);
    res.status(500).json({ message: 'Ошибка при изменении лайка комментария' });
  }
};

//по макету не требуется
// ================Получить лайки комментария=======================
// export const getCommentLikes = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { commentId } = req.params;
//     const likes = await Like.find({ comment: commentId }).populate(
//       'user',
//       'username profile_image'
//     );
//     res.json(likes);
//   } catch (error) {
//     console.error('Ошибка при получении лайков комментария:', error);
//     res
//       .status(500)
//       .json({ message: 'Ошибка при получении лайков комментария' });
//   }
// };
