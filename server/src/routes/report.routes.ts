import { Router } from 'express';
import { 
  getRevenueReport, 
  getProjectsReport, 
  getTimeReport, 
  getExpensesReport, 
  getTaxReport 
} from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/revenue', getRevenueReport as any);
router.get('/projects', getProjectsReport as any);
router.get('/time', getTimeReport as any);
router.get('/expenses', getExpensesReport as any);
router.get('/tax-summary', getTaxReport as any);

export default router;
