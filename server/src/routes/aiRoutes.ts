import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  categorizeTransaction,
  chatAssistant,
  getFinancialInsights,
} from '../controllers/aiController.js';

const router = Router();

router.use(requireAuth);

router.post('/categorize', categorizeTransaction);
router.post('/chat', chatAssistant);
router.get('/insights', getFinancialInsights);

export default router;

