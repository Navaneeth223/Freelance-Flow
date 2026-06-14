import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getExpenses as any)
  .post(createExpense as any);

router.route('/:id')
  .patch(updateExpense as any)
  .delete(deleteExpense as any);

export default router;
