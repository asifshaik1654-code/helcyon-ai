import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getRecurringPayments,
  createRecurringPayment,
  confirmRecurringPayment,
  dismissRecurringPayment,
  updateRecurringPayment,
  deleteRecurringPayment,
} from '../controllers/recurringController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getRecurringPayments);
router.post('/', createRecurringPayment);
router.post('/:id/confirm', confirmRecurringPayment);
router.post('/:id/dismiss', dismissRecurringPayment);
router.put('/:id', updateRecurringPayment);
router.delete('/:id', deleteRecurringPayment);

export default router;

