import { Router } from 'express';
import { 
  getInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoice, 
  deleteInvoice, 
  markPaid, 
  sendInvoice, 
  getInvoicePdf 
} from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware as any);

router.route('/')
  .get(getInvoices as any)
  .post(createInvoice as any);

router.route('/:id')
  .get(getInvoiceById as any)
  .patch(updateInvoice as any)
  .delete(deleteInvoice as any);

router.post('/:id/send', sendInvoice as any);
router.post('/:id/mark-paid', markPaid as any);
router.get('/:id/pdf', getInvoicePdf as any);

export default router;
