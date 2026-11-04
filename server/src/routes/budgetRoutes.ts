import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getBudgets,
  getBudgetAlerts,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getBudgets);
router.get('/alerts', getBudgetAlerts);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
