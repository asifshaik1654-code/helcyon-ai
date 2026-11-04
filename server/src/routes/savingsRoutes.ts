import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  addGoalContribution,
} from '../controllers/savingsController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getSavingsGoals);
router.post('/', createSavingsGoal);
router.put('/:id', updateSavingsGoal);
router.delete('/:id', deleteSavingsGoal);
router.post('/:id/contribute', addGoalContribution);

export default router;
