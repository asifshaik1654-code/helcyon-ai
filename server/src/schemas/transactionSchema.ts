import { z } from 'zod';

export const createTransactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  amount: z.number().positive('Amount must be greater than zero'),
  transactionType: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Transaction type must be income or expense' }),
  }),
  category: z.string().min(1, 'Category is required'),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  paymentMethod: z.string().default('UPI'),
  description: z.string().optional().default(''),
  isRecurring: z.boolean().optional().default(false),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const queryTransactionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['all', 'income', 'expense']).optional().default('all'),
  category: z.string().optional().default('all'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sortBy: z.enum(['transaction_date', 'amount', 'created_at']).optional().default('transaction_date'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const importBatchSchema = z.object({
  transactions: z.array(createTransactionSchema).min(1, 'At least one transaction is required for import'),
});

