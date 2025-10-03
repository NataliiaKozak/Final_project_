import { Request, Response } from 'express';
import User from '../models/UserModel';
import Post from '../models/PostModel';
import Comment from '../models/CommentModel';
import Like from '../models/LikeModel';
import Notification from '../models/NotificationModel';
import { RequestWithUser } from '../middlewares/authMiddleware';
import multer from 'multer';
import { uploadToS3 } from '../config/s3';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 🔹 Получение профиля пользователя
export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // const { id } = req.params;//берёт :id из URL (например, /users/123)
    // // const user = await User.findById(id).select('-password');
    // const user = await User.findById(req.params.id)
    //   .select("-password") // скрываем  хэш пароля при выдаче данных пользователю.
    //   .populate("followers", "username profile_image")
    //   .populate("following", "username profile_image");//вместо того чтобы возвращать только массив ObjectId,
    //   // ты сразу получаешь данные подписчиков/подписок

    const id = req.params.id;

    const user = await User.findById(id)
      .select('-password') // скрываем хэш пароля
      .populate('followers', 'username profile_image')
      .populate('following', 'username profile_image');

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }
    // const { id } = req.params;
    // Считаем статистику
    const postsCount = await Post.countDocuments({ author: id });
    const commentsCount = await Comment.countDocuments({ user: id });
    const likesCount = await Like.countDocuments({ user: id });
    const notificationsCount = await Notification.countDocuments({ user: id });

    res.status(200).json({
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      commentsCount,
      likesCount,
      notificationsCount,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// 🔹 Обновление профиля
export const updateProfile = async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { username, bio, fullName, website } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

     // обновляем только если поля пришли
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (fullName !== undefined) user.fullName = fullName;
    if (website !== undefined) user.website = website;

    if (req.file) {
      const imageUrl = await uploadToS3(req.file, 'avatars');
      user.profile_image = imageUrl;
    }

    await user.save();
    res.json(user);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Update profile error', error: error.message });
  }
};

// const userId = req.user?.id;
//     if (!userId) {
//       res.status(401).json({ message: "Unauthorized" });
//       return;
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       res.status(404).json({ message: "User not found" });
//       return;
//     }

//     if (req.body.username) user.username = req.body.username;
//     if (req.body.fullName) user.fullName = req.body.fullName;
//     if (req.body.bio) user.bio = req.body.bio;
//     if (req.body.website) user.website = req.body.website;

//     if (req.file) {
//       const imageUrl = await uploadToS3(req.file, "avatars");
//       user.profile_image = imageUrl;
//     }

//     await user.save();
//     res.json(user);
//   } catch (err: unknown) {
//     const error = err as Error;
//     res
//       .status(500)
//       .json({ message: "Ошибка при обновлении профиля", error: error.message });
//   }
// };
