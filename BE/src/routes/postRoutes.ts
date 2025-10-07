import { Router } from "express";
import {
  getUserPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  explorePosts,
} from '../controllers/postController.js';
import { protect } from '../middlewares/authMiddleware.js';
// import { upload } from '../middlewares/uploadMiddleware'; // только upload, без sharp
import { upload, processImage } from "../middlewares/uploadImage.js"; //с оптимизацией

const router = Router();

// /api/posts/user/:userId → все посты пользователя
router.get('/user/:userId', getUserPosts);

// /api/posts → создать пост
router.post('/', protect, upload.single('image'), processImage, createPost);

// /api/posts/:id → обновить пост
router.put('/:id', protect, upload.single('image'), processImage, updatePost);

// /api/posts/:id → удалить пост
router.delete('/:id', protect, deletePost);

// /api/posts → получить все посты
router.get('/', getAllPosts);

// /api/posts/explore → explore
router.get('/explore', explorePosts);

// /api/posts/:id → получить пост по id

router.get('/:id', getPostById);
export default router;
