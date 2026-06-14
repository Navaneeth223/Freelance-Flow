import { Router } from 'express';
import { 
  getTimeEntries, 
  createTimeEntry, 
  stopActiveTimer, 
  updateTimeEntry, 
  deleteTimeEntry 
} from '../controllers/timeEntry.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getTimeEntries as any)
  .post(createTimeEntry as any);

router.post('/stop', stopActiveTimer as any);

router.route('/:id')
  .patch(updateTimeEntry as any)
  .delete(deleteTimeEntry as any);

export default router;
