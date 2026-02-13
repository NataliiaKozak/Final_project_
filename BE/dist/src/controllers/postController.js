import { Types } from 'mongoose'; //чтобы создавать ObjectId для Mongo
import multer from 'multer'; //библиотека для загрузки файлов
import Post from '../models/PostModel.js';
import Like from '../models/LikeModel.js';
import Comment from '../models/CommentModel.js';
import { uploadToS3 } from '../config/s3.js'; //функция для загрузки изображений в Amazon S3
// Multer storage. Хранилище для multer (память, потом → S3)
const storage = multer.memoryStorage();
export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
/* ==================== Получить все посты ====================*/
export const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const filter = {};
        if (req.query.excludeAuthor) {
            filter.author = { $ne: req.query.excludeAuthor };
        }
        const posts = await Post.find(filter)
            .populate('author', 'username profileImage fullName')
            .sort({ createdAt: -1 })
            .lean();
        // Считаем реальные likesCount, commentsCount и isLikedByMe
        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const likesCount = await Like.countDocuments({ post: post._id });
            const commentsCount = await Comment.countDocuments({ post: post._id });
            const isLikedByMe = currentUserId
                ? (await Like.exists({ user: currentUserId, post: post._id })) !== null
                : false;
            return { ...post, likesCount, commentsCount, isLikedByMe };
        }));
        res.json(postsWithCounts);
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
        const { userId } = req.params;
        const currentUserId = req.user?.id;
        const posts = await Post.find({ author: userId })
            .populate('author', 'username profileImage fullName')
            .sort({ createdAt: -1 })
            .lean();
        if (!posts || posts.length === 0) {
            res.status(404).json({ message: 'У пользователя нет постов' });
            return;
        }
        const postsWithCounts = await Promise.all(posts.map(async (post) => {
            const likesCount = await Like.countDocuments({ post: post._id });
            const commentsCount = await Comment.countDocuments({ post: post._id });
            const isLikedByMe = currentUserId
                ? (await Like.exists({ user: currentUserId, post: post._id })) !== null
                : false;
            return { ...post, likesCount, commentsCount, isLikedByMe };
        }));
        res.json(postsWithCounts);
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
        })
            .lean();
        if (!post) {
            res.status(404).json({ message: 'Пост не найден' });
            return;
        }
        const currentUserId = req.user?.id;
        const likesCount = await Like.countDocuments({ post: post._id });
        const commentsCount = await Comment.countDocuments({ post: post._id });
        const isLikedByMe = currentUserId
            ? (await Like.exists({ user: currentUserId, post: post._id })) !== null
            : false;
        res.json({ ...post, likesCount, commentsCount, isLikedByMe });
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
        //Проверка авторизации пользователя (req.user.id)
        if (!req.user?.id) {
            res.status(401).json({ message: 'Неавторизованный пользователь' });
            return;
        }
        //Проверка загрузки файла
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
        //Создаём новый Post. author сохраняем как ObjectId
        const newPost = new Post({
            author: new Types.ObjectId(req.user.id),
            image: imageUrl,
            description: req.body.description || '',
            // createdAt: new Date(),
        });
        await newPost.save(); //Сохраняем его в базе
        res.status(201).json(newPost);
    }
    catch (err) {
        const error = err;
        res
            .status(500)
            .json({ message: 'Ошибка при создании поста', error: error.message });
    }
};
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