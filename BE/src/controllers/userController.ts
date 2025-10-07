import { Request, Response } from 'express';
import User from '../models/UserModel.js';
import Post from '../models/PostModel.js';
import Comment from '../models/CommentModel.js';
import Like from '../models/LikeModel.js';
import Notification from '../models/NotificationModel.js';
import Follow from '../models/FollowModel.js';
import { RequestWithUser } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import { uploadToS3 } from '../config/s3.js';

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// 🔹 Получение профиля пользователя
export const getProfile = async (
  req: RequestWithUser,//используем расширенный тип
  res: Response
): Promise<void> => {
  try {
    // const { id } = req.params;//берёт :id из URL (например, /users/123)
    // // const user = await User.findById(id).select('-password');
    // const user = await User.findById(req.params.id)
    //   .select("-password") // скрываем  хэш пароля при выдаче данных пользователю.
    //   .populate("followers", "username profileImage")
    //   .populate("following", "username profileImage");//вместо того чтобы возвращать только массив ObjectId,
    //   // ты сразу получаешь данные подписчиков/подписок

    const id = req.params.id;

    const user = await User.findById(id)
      .select('-password') // скрываем хэш пароля
      .populate('followers', 'username profileImage')
      .populate('following', 'username profileImage');

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

    // проверяем, подписан ли текущий пользователь (для чужого профиля)
    let isFollowing = false;
    if (req.user?.id && req.user.id !== id) {
      const existing = await Follow.findOne({
        follower: req.user.id,
        following: id,
      });
      isFollowing = !!existing;
    }
    res.status(200).json({
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length,
      postsCount,
      commentsCount,
      likesCount,
      notificationsCount,
      isFollowing,
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ message: 'Error fetching profile', error });
  }
};

// 🔹 Обновление профиля
export const updateProfile = async (req: RequestWithUser, res: Response) => {
  try {
    //TEMP
    console.log('[PUT /api/users] has file?', !!req.file, req.file?.mimetype, req.file?.size);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { username, bio, fullName, website } = req.body;

    //после поверки в Постманн, чтобы не возвращать пароль
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // обновляем только если поля пришли
    if (username !== undefined) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (fullName !== undefined) user.fullName = fullName;
    if (website !== undefined) user.website = website;

    if (req.file) {
      const imageUrl = await uploadToS3(req.file, 'profileImages');
      // console.log('[PUT /api/users] imageUrl:', imageUrl);
      user.profileImage = imageUrl;
    }

    await user.save();
    //после проверки в Постманн: не возвращать пароль
    // const { password, __v, ...safe } = user.toObject();
    const {__v, ...safe } = user.toObject();
return res.json(safe);
    // res.json(user);

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
//       const imageUrl = await uploadToS3(req.file, "profileImages");
//       user.profileImage = imageUrl;
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
