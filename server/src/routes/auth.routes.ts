import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware as any, getMe as any);
router.patch('/profile', authMiddleware as any, updateProfile as any);

export default router;
