import { Request, Response } from 'express';
import Comment from '../models/CommentModel';
import Post from '../models/PostModel';
import { RequestWithUser } from '../middlewares/authMiddleware';
import { createNotification } from './notificationController';

// ===============Добавить комментарий========================
export const addComment = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Требуется авторизация' });
      return;
    }

    if (!text) {
      res.status(400).json({ message: 'Комментарий не может быть пустым' });
      return;
    }

    const post = await Post.findById(postId).populate(
      'author',
      '_id username profile_image'
    );

    if (!post) {
      res.status(404).json({ message: 'Пост не найден' });
      return;
    }

    const comment = new Comment({
      user: userId,
      post: post._id,
      text,
      // author: post.author?._id // только user, без author
    });

    await comment.save();

    // =================Уведомление автору поста===============
    if (post.author && post.author._id.toString() !== userId) {
      await createNotification(
        post.author._id,
        userId,
        'commented_post',
        post._id,
        comment._id
      );
    }

    await comment.populate('user', 'username profile_image');
    res.json({ message: 'Комментарий добавлен', comment });
  } catch (error) {
    console.error('Ошибка при добавлении комментария:', error);
    res.status(500).json({ message: 'Ошибка при добавлении комментария' });
  }
};

// ====================Удалить комментарий====================
export const deleteComment = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    const { commentId } = req.params;
    const userId = req.user?.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ message: 'Комментарий не найден' });
      return;
    }

    // проверяем только владельца комментария
    if (
      comment.user.toString() !== userId
      // comment.user.toString() !== userId
      // && comment.author?.toString() !== userId
    ) {
      res.status(403).json({ message: 'Нет прав для удаления' });
      return;
    }

    await comment.deleteOne();
    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    console.error('Ошибка при удалении комментария:', error);
    res.status(500).json({ message: 'Ошибка при удалении комментария' });
  }
};

// ==================Получить комментарии к посту========================
export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ post: postId })
      .populate('user', 'username profile_image');
      // .populate('author', 'username profile_image');

    res.json(comments);
  } catch (error) {
    console.error('Ошибка при получении комментариев:', error);
    res.status(500).json({ message: 'Ошибка при получении комментариев' });
  }
};
