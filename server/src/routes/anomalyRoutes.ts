import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getAnomalies, dismissAnomaly } from '../controllers/anomalyController.js';

const router = Router();

router.use(requireAuth);

router.get('/', getAnomalies);
router.post('/:id/dismiss', dismissAnomaly);

export default router;

