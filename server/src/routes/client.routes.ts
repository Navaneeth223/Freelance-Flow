import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/client.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getClients as any)
  .post(createClient as any);

router.route('/:id')
  .get(getClientById as any)
  .patch(updateClient as any)
  .delete(deleteClient as any);

export default router;
