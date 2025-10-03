import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';

const router = Router();

// /api/users/:id → получить профиль → получить профиль (открытый маршрут)
router.get('/:id', getProfile);

// /api/users → обновить профиль (аватар и данные) → обновить профиль (защищённый маршрут), middleware проверяет JWT
router.put('/', protect, upload.single('avatar'), updateProfile);

export default router;
