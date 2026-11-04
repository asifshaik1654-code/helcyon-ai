import { z } from 'zod';

export const createRecurringSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  amount: z
    .number({ invalid_type_error: 'Amount must be a number' })
    .positive('Amount must be greater than zero'),
  category: z.string().min(1, 'Category is required'),
  frequency: z.enum(['weekly', 'monthly', 'quarterly', 'yearly']).default('monthly'),
  nextPaymentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Next payment date must be formatted as YYYY-MM-DD'),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
});

export const updateRecurringSchema = createRecurringSchema.partial();

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;
export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;

