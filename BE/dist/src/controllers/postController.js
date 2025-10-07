import { Types } from 'mongoose'; //чтобы создавать ObjectId для Mongo
import multer from 'multer'; //библиотека для загрузки файлов.
import Post from '../models/PostModel.js';
import { uploadToS3 } from '../config/s3.js'; //функция для загрузки изображений в Amazon S3
// Multer storage. Хранилище для multer (память, потом → S3)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
//upload потом используется в маршрутах (upload.single("image")
/* ==================== Получить все посты ====================*/
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find() //достаём все посты из базы (например, для ленты)
            .populate('author', 'username profileImage fullName') //вместо author: ObjectId подставляем данные о пользователе (имя + фото профиля)
            .sort({ createdAt: -1 }); //новые сверху
        // Виртуальные поля (likesCount, commentsCount) добавятся автоматически
        res.json(posts); //Отправляем клиенту список постов
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при получении постов', error: error.message });
    }
};
/* =================== Посты конкретного пользователя ===================== */
export const getUserPosts = async (req, res) => {
    try {
        const { userId } = req.params; //из URL /api/posts/user/:userId
        //     const user = await User.findById(userId).populate('posts'); //Ищем пользователя в базе и сразу подтягиваем его posts через populate
        //     изменение из-за виртуального поля posts в UserModel.ts. Posts теперь берутся через виртуалку в UserModel
        //     const user = await User.findById(userId)
        //       .populate({
        //         path: "posts",
        //         populate: { path: "author", select: "username profileImage" }, // подтянем автора в каждом посте
        //       })
        //       .select("username profileImage fullName posts"); // отдаем только нужное, мы исключаем пароль и ненужные поля
        //        if (!user) {
        //       res.status(404).json({ message: 'Пользователь не найден' });
        //       return;
        //     }
        //     res.json(user.posts);
        //   } catch (err: unknown) {
        //     const error = err as Error;
        //     res
        //       .status(500)
        //       .json({ message: 'Ошибка при получении постов', error: error.message });
        //   }
        // };
        // populate('posts') немного тяжелее по производительности, чем Post.find({ author: userId }), потому что:
        // populate делает два запроса (ищет User, потом Post). // Post.find делает сразу прямой запрос.
        // Если нам нужно вернуть профиль пользователя вместе с постами → лучше использовать populate("posts").
        // Если мы хотим отдельный эндпоинт только для постов → лучше Post.find({ author }).
        // Ищем посты напрямую по Post (без user.posts, т.к. массива posts нет в UserModel)
        const posts = await Post.find({ author: userId })
            // .populate('author', 'username profileImage')
            .select('_id image createdAt') // только превью для профиля
            .sort({ createdAt: -1 });
        if (!posts || posts.length === 0) {
            res.status(404).json({ message: 'У пользователя нет постов' });
            return;
        }
        res.json(posts);
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при получении постов', error: error.message });
    }
};
/* ================== Пост по ID (детальный просмотр)=======================*/
export const getPostById = async (req, res) => {
    try {
        // const post = await Post.findById(req.params.id).populate(
        //   'author',
        //   'username fullName profileImage'
        // );
        //Проверка ID
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Некорректный ID поста' });
            return;
        }
        const post = await Post.findById(req.params.id)
            .populate('author', 'username fullName profileImage')
            .populate({
            path: 'comments',
            populate: { path: 'user', select: 'username fullName profileImage' },
        });
        //при открытии детального экрана поста уже будут автор поста,
        // картинка и описание поста,массив комментариев с авторами
        // виртуальные поля likesCount, commentsCount подтянутся автоматически (виртуалы)
        if (!post) {
            res.status(404).json({ message: 'Пост не найден' });
            return;
        }
        res.json(post);
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при получении поста', error: error.message });
    }
};
/*=================== Создание поста ======================================*/
export const createPost = async (req, res) => {
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
        //добавлена проверка длины description → максимум 200 символов
        const description = req.body.description || '';
        // Ограничиваем описание 200 символами
        if (description.length > 200) {
            res
                .status(400)
                .json({ message: 'Описание не может превышать 200 символов' });
            return;
        }
        // Загружаем фото в S3
        const imageUrl = await uploadToS3(req.file, 'posts'); //Загружаем файл в S3 → получаем imageUrl
        // author сохраняем как ObjectId (иначе TS ругается на string → ObjectId)
        //Создаём новый Post
        const newPost = new Post({
            author: new Types.ObjectId(req.user.id),
            image: imageUrl,
            description: req.body.description || '',
            // createdAt: new Date(),
        });
        await newPost.save(); //Сохраняем его в базе
        //удалено за ненадобностью
        // await User.findByIdAndUpdate(req.user.id, {
        //   $push: { posts: newPost._id },
        // }); //Дополнительно обновляем User: добавляем в массив posts ID нового поста
        res.status(201).json(newPost);
    }
    catch (err) {
        const error = err;
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
//       profileImage: user.profileImage,
//       caption: req.body.caption,
//       created_at: new Date(),
//     });
/*=================== Обновление поста =================================*/
export const updatePost = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Неавторизованный пользователь' });
            return;
        }
        // Проверка ID
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Некорректный ID поста' });
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
        // if (req.body.description) post.description = req.body.description;
        // проверка: если описание есть → ограничиваем 200 символов
        if (req.body.description) {
            if (req.body.description.length > 200) {
                res
                    .status(400)
                    .json({ message: 'Описание поста не может превышать 200 символов' });
                return;
            }
            post.description = req.body.description;
        }
        //Если загружено новое изображение → загружаем в S3 и меняем ссылку
        if (req.file) {
            const imageUrl = await uploadToS3(req.file, 'posts');
            post.image = imageUrl;
        }
        await post.save();
        res.json(post);
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при обновлении поста', error: error.message });
    }
};
/*===================== Удаление поста ====================================*/
export const deletePost = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).json({ message: 'Неавторизованный пользователь' });
            return;
        }
        // Проверка ID
        if (!Types.ObjectId.isValid(req.params.id)) {
            res.status(400).json({ message: 'Некорректный ID поста' });
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
        // await User.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } }); убрано. т.к.в UserModel нет массива posts
        res.json({ message: 'Пост удалён' });
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при удалении поста', error: error.message });
    }
};
/*====================== Explore (случайные посты) =======================*/
export const explorePosts = async (req, res) => {
    try {
        const postCount = await Post.countDocuments();
        if (postCount === 0) {
            res.json({ message: 'Нет постов для отображения' });
            return;
        }
        const sampleSize = postCount < 10 ? postCount : 10;
        //Выбираем случайно 10 постов($sample)
        // ⚡️ Берём случайные посты через aggregate + джоин к User
        // const posts = await Post.aggregate([
        //   { $sample: { size: sampleSize } },
        //   // { $sort: { createdAt: -1 } }, //добавлено
        // ])
        //   .lookup({
        //     //подключаем данные о пользователях (авторах)
        //     from: 'users',
        //     localField: 'author',
        //     foreignField: '_id',
        //     as: 'author',
        //   })
        //   .unwind({ path: '$author', preserveNullAndEmptyArrays: true }) //разворачиваем массив авторов
        //   .project({
        //     //берём только нужные поля
        //     image: 1,
        //     description: 1,
        //     createdAt: 1,
        //     'author.username': 1,
        //     'author.profileImage': 1,
        //     likes: 1,
        //     comments: 1,
        //   });
        //вариант
        //   const posts = await Post.aggregate([
        //   { $sample: { size: sampleSize } },
        //   { $sort: { createdAt: -1 } },
        // ]);
        // res.json(posts);
        // const sampleSize = Math.min(total, 10); // можно поменять на любое фиксированное число
        const posts = await Post.aggregate([
            { $sample: { size: sampleSize } },
            { $project: { _id: 1, image: 1, createdAt: 1 } }, // только превью
        ]);
        res.json(posts);
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при explore-постах', error: error.message });
    }
};
//# sourceMappingURL=postController.js.map