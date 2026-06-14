import { Router } from 'express';
import { getDashboardStats, getDashboardDeadlines, getDashboardActivity } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/stats', getDashboardStats as any);
router.get('/deadlines', getDashboardDeadlines as any);
router.get('/activity', getDashboardActivity as any);

export default router;
