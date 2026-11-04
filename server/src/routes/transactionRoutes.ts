import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  getTransactionSummary,
} from '../controllers/transactionController.js';

const router = Router();

// All routes require an authenticated user
router.use(requireAuth);

// GET /api/transactions/summary  — must be before /:id to avoid "summary" being treated as an ID
router.get('/summary', getTransactionSummary);

// GET  /api/transactions          — paginated + filtered list
router.get('/', getTransactions);

// GET  /api/transactions/:id      — single transaction
router.get('/:id', getTransactionById);

// POST /api/transactions          — create a transaction
router.post('/', createTransaction);

// POST /api/transactions/import   — CSV batch import
router.post('/import', importTransactions);

// PUT  /api/transactions/:id      — update a transaction
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id    — delete a transaction
router.delete('/:id', deleteTransaction);

export default router;

