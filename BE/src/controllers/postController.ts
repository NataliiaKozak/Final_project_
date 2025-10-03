import { Request, Response } from 'express';
import { Types } from 'mongoose'; //чтобы создавать ObjectId для Mongo
import multer from 'multer'; //библиотека для загрузки файлов.
import Post, { IPost } from '../models/PostModel';
import User from '../models/UserModel';
import { RequestWithUser } from '../middlewares/authMiddleware'; //расширенный тип запроса (с req.user).
import { uploadToS3 } from '../config/s3'; //функция для загрузки изображений в Amazon S3

// Хранилище для multer (память, потом → S3)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
//upload потом используется в маршрутах (upload.single("image")

/* 🔹 Получить все посты */
export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Post.find() //достаём все посты из базы
      .populate('author', 'username profile_image') //вместо author: ObjectId подставляем данные о пользователе (имя + фото профиля)
      .sort({ createdAt: -1 }); //новые сверху
    res.json(posts); //Отправляем клиенту список постов
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при получении постов', error: error.message });
  }
};

/* 🔹 Посты конкретного пользователя */
export const getUserPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params; //из URL (/posts/user/:userId)

    const user = await User.findById(userId).populate('posts'); //Ищем пользователя в базе и сразу подтягиваем его posts через populate
    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    res.json(user.posts);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при получении постов', error: error.message });
  }
};

/* 🔹 Пост по ID */
export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'username profile_image'
    );
    if (!post) {
      res.status(404).json({ message: 'Пост не найден' });
      return;
    }
    res.json(post);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при получении поста', error: error.message });
  }
};

/*🔹 Создание поста */
export const createPost = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    //Проверяем, что пользователь авторизован (req.user.id)
    if (!req.user?.id) {
      res.status(401).json({ message: 'Неавторизованный пользователь' });
      return;
    }
    //Проверяем, что файл загружен
    if (!req.file) {
      res.status(400).json({ message: 'Изображение обязательно' });
      return;
    }

    const imageUrl = await uploadToS3(req.file, 'posts'); //Загружаем файл в S3 → получаем imageUrl

    //Создаём новый Post
    const newPost: IPost = new Post({
      author: new Types.ObjectId(req.user.id),
      image: imageUrl,
      description: req.body.description || '',
      // createdAt: new Date(),
    });

    await newPost.save(); //Сохраняем его в базе

    await User.findByIdAndUpdate(req.user.id, {
      $push: { posts: newPost._id },
    }); //Дополнительно обновляем User: добавляем в массив posts ID нового поста

    res.status(201).json(newPost);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при создании поста', error: error.message });
  }
};

// // Создание поста с загрузкой фото в S3
// export const createPost = async (req: RequestWithUser, res: Response) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     if (!req.file) return res.status(400).json({ message: "Image required" });

//     const imageUrl = await uploadToS3(req.file, "posts");

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const post = new Post({
//       user_id: user._id,
//       image_url: imageUrl, 
//       user_name: user.username,
//       profile_image: user.profile_image,
//       caption: req.body.caption,
//       created_at: new Date(),
//     });



/*🔹 Обновление поста */
export const updatePost = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Неавторизованный пользователь' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Пост не найден' });
      return;
    }

    //Проверяем, что текущий пользователь = автор поста
    if (post.author.toString() !== req.user.id) {
      res.status(403).json({ message: 'Нет прав для редактирования' });
      return;
    }
    //Если есть новое описание → обновляем.
    if (req.body.description) post.description = req.body.description;
    //Если загружено новое изображение → загружаем в S3 и меняем ссылку
    if (req.file) {
      const imageUrl = await uploadToS3(req.file, 'posts');
      post.image = imageUrl;
    }

    await post.save();
    res.json(post);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при обновлении поста', error: error.message });
  }
};

/*🔹 Удаление поста */
export const deletePost = async (
  req: RequestWithUser,
  res: Response
): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Неавторизованный пользователь' });
      return;
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ message: 'Пост не найден' });
      return;
    }
    //автор = текущий пользователь
    if (post.author.toString() !== req.user.id) {
      res.status(403).json({ message: 'Нет прав для удаления' });
      return;
    }

    await post.deleteOne();
    await User.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } });

    res.json({ message: 'Пост удалён' });
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при удалении поста', error: error.message });
  }
};

/*🔹 Explore (случайные посты) */
export const explorePosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      res.json({ message: 'Нет постов для отображения' });
      return;
    }

    const sampleSize = postCount < 10 ? postCount : 10;
    //Выбираем случайно 10 постов($sample)
    const posts = await Post.aggregate([{ $sample: { size: sampleSize } }])
      .lookup({
        //подключаем данные о пользователях (авторах)
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      })
      .unwind({ path: '$author', preserveNullAndEmptyArrays: true }) //разворачиваем массив авторов
      .project({
        //берём только нужные поля
        image: 1,
        description: 1,
        createdAt: 1,
        'author.username': 1,
        'author.profile_image': 1,
        likes: 1,
        comments: 1,
      });

    res.json(posts);
  } catch (err: unknown) {
    const error = err as Error;
    res
      .status(500)
      .json({ message: 'Ошибка при explore-постах', error: error.message });
  }
};
