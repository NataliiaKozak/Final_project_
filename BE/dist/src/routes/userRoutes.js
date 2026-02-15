import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { uploadAvatar } from '../middlewares/upload.js';
const router = Router();
// /api/users/:id → получить профиль
router.get('/:id', protect, getProfile);
// /api/users → обновить профиль (аватар и данные)
router.put('/', protect, uploadAvatar.single('profileImage'), updateProfile);
export default router;
//# sourceMappingURL=userRoutes.js.map