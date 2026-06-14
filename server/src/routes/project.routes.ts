import { Router } from 'express';
import { getProjects, getProjectById, createProject, updateProject, deleteProject } from '../controllers/project.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getProjects as any)
  .post(createProject as any);

router.route('/:id')
  .get(getProjectById as any)
  .patch(updateProject as any)
  .delete(deleteProject as any);

export default router;
