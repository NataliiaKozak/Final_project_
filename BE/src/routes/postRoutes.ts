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
import { upload, processImage } from "../middlewares/uploadImage.js"; //с оптимизацией

const router = Router();

// /api/posts/user/:userId → все посты пользователя
router.get('/user/:userId', protect, getUserPosts);

// /api/posts → создать пост
router.post('/', protect, upload.single('image'), processImage, createPost);

// /api/posts/:id → обновить пост
router.put('/:id', protect, upload.single('image'), processImage, updatePost);

// /api/posts/:id → удалить пост
router.delete('/:id', protect, deletePost);

// /api/posts/explore → explore (before /:id to avoid matching "explore" as :id)
router.get('/explore', explorePosts);

// /api/posts → получить все посты (с auth для isLikedByMe)
router.get('/', protect, getAllPosts);

// /api/posts/:id → получить пост по id
router.get('/:id', protect, getPostById);
export default router;
