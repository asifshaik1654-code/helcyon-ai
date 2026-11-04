import { z } from 'zod';

export const createGoalSchema = z.object({
  goalName: z.string().min(2, 'Goal name must be at least 2 characters'),
  targetAmount: z
    .number({ invalid_type_error: 'Target amount must be a number' })
    .positive('Target amount must be greater than zero'),
  currentAmount: z
    .number({ invalid_type_error: 'Current amount must be a number' })
    .nonnegative('Current amount cannot be negative')
    .default(0),
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Target date must be in YYYY-MM-DD format')
    .optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amount: z
    .number({ invalid_type_error: 'Contribution amount must be a number' })
    .positive('Contribution amount must be greater than zero'),
  note: z.string().max(200, 'Note must be at most 200 characters').optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>;

