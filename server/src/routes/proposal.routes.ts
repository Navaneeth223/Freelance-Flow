import { Router } from 'express';
import { 
  getProposals, 
  getProposalById, 
  createProposal, 
  updateProposal, 
  deleteProposal, 
  sendProposal 
} from '../controllers/proposal.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getProposals as any)
  .post(createProposal as any);

router.route('/:id')
  .get(getProposalById as any)
  .patch(updateProposal as any)
  .delete(deleteProposal as any);

router.post('/:id/send', sendProposal as any);

export default router;
