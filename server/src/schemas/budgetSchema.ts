import { z } from 'zod';

export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  budgetAmount: z
    .number({ invalid_type_error: 'Budget amount must be a number' })
    .positive('Budget amount must be greater than zero'),
  budgetMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Budget month must be formatted as YYYY-MM (e.g. 2026-11)'),
});

export const updateBudgetSchema = z.object({
  budgetAmount: z
    .number({ invalid_type_error: 'Budget amount must be a number' })
    .positive('Budget amount must be greater than zero'),
});

export const queryBudgetSchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type QueryBudgetInput = z.infer<typeof queryBudgetSchema>;

