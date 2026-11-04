import { Request, Response } from 'express';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createGoalSchema,
  updateGoalSchema,
  contributeGoalSchema,
} from '../schemas/savingsSchema.js';

export interface StoredGoal {
  id: string;
  user_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
}

export interface StoredContribution {
  id: string;
  goal_id: string;
  amount: number;
  contribution_date: string;
  note?: string;
  created_at: string;
}

let mockGoalsStore: StoredGoal[] = [
  {
    id: 'goal_demo_01',
    user_id: '00000000-0000-0000-0000-000000000001',
    goal_name: 'Emergency Safety Reserve',
    target_amount: 150000,
    current_amount: 95000,
    target_date: '2027-04-30',
    priority: 'high',
    created_at: '2026-08-01T00:00:00Z',
  },
  {
    id: 'goal_demo_02',
    user_id: '00000000-0000-0000-0000-000000000001',
    goal_name: 'MacBook Pro Development Rig',
    target_amount: 180000,
    current_amount: 120000,
    target_date: '2027-02-15',
    priority: 'high',
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'goal_demo_03',
    user_id: '00000000-0000-0000-0000-000000000001',
    goal_name: 'Annual Tech Conference Trip',
    target_amount: 45000,
    current_amount: 18000,
    target_date: '2027-07-20',
    priority: 'medium',
    created_at: '2026-10-01T00:00:00Z',
  },
];

let mockContributionsStore: StoredContribution[] = [
  {
    id: 'contrib_demo_01',
    goal_id: 'goal_demo_01',
    amount: 15000,
    contribution_date: '2026-11-01',
    note: 'Monthly salary allocation to emergency fund',
    created_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'contrib_demo_02',
    goal_id: 'goal_demo_02',
    amount: 20000,
    contribution_date: '2026-11-02',
    note: 'Freelance project surplus contribution',
    created_at: '2026-11-02T14:30:00Z',
  },
];

function calculateGoalMetrics(goal: any, contributions: any[] = []) {
  const target = Number(goal.target_amount ?? goal.targetAmount);
  const current = Number(goal.current_amount ?? goal.currentAmount);
  const remaining = Math.max(0, target - current);
  const progressPct = target > 0 ? Math.min(100, Number(((current / target) * 100).toFixed(1))) : 0;

  // Calculate suggested monthly contribution if target date is set
  let suggestedMonthlyContribution = 0;
  let monthsRemaining = 0;
  const targetDateStr = goal.target_date || goal.targetDate;

  if (targetDateStr) {
    const today = new Date();
    const tDate = new Date(targetDateStr);
    monthsRemaining = Math.max(
      1,
      (tDate.getFullYear() - today.getFullYear()) * 12 + (tDate.getMonth() - today.getMonth())
    );
    if (remaining > 0) {
      suggestedMonthlyContribution = Math.ceil(remaining / monthsRemaining);
    }
  }

  return {
    id: goal.id,
    userId: goal.user_id || goal.userId,
    goalName: goal.goal_name || goal.goalName,
    targetAmount: target,
    currentAmount: current,
    targetDate: targetDateStr,
    priority: goal.priority || 'medium',
    progressPercentage: progressPct,
    remainingAmount: remaining,
    suggestedMonthlyContribution,
    monthsRemaining,
    isCompleted: current >= target,
    contributions: contributions.map((c) => ({
      id: c.id,
      goalId: c.goal_id || c.goalId,
      amount: Number(c.amount),
      contributionDate: c.contribution_date || c.contributionDate,
      note: c.note || undefined,
      createdAt: c.created_at || c.createdAt,
    })),
    createdAt: goal.created_at || goal.createdAt,
  };
}

export async function getSavingsGoals(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data: goals, error: gError } = await supabase
        .from('savings_goals')
        .select('*, savings_contributions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (gError) {
        return sendError(res, gError.message, 400, 'FETCH_GOALS_ERROR');
      }

      const formatted = (goals || []).map((g) =>
        calculateGoalMetrics(g, g.savings_contributions || [])
      );

      const totalTarget = formatted.reduce((s, g) => s + g.targetAmount, 0);
      const totalSaved = formatted.reduce((s, g) => s + g.currentAmount, 0);

      return sendSuccess(res, {
        goals: formatted,
        summary: {
          totalGoals: formatted.length,
          totalSaved,
          totalTarget,
          overallProgress: totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0,
        },
      });
    }

    const userGoals = mockGoalsStore.filter((g) => g.user_id === userId);
    const formatted = userGoals.map((g) => {
      const relatedContribs = mockContributionsStore.filter((c) => c.goal_id === g.id);
      return calculateGoalMetrics(g, relatedContribs);
    });

    const totalTarget = formatted.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = formatted.reduce((s, g) => s + g.currentAmount, 0);

    return sendSuccess(res, {
      goals: formatted,
      summary: {
        totalGoals: formatted.length,
        totalSaved,
        totalTarget,
        overallProgress: totalTarget > 0 ? Number(((totalSaved / totalTarget) * 100).toFixed(1)) : 0,
      },
    });
  } catch (err: any) {
    console.error('[getSavingsGoals Error]:', err);
    return sendError(res, 'Failed to fetch savings goals', 500, 'SERVER_ERROR');
  }
}

export async function createSavingsGoal(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = createGoalSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { goalName, targetAmount, currentAmount, targetDate, priority } = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('savings_goals')
        .insert({
          user_id: userId,
          goal_name: goalName,
          target_amount: targetAmount,
          current_amount: currentAmount,
          target_date: targetDate || null,
          priority,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, error.message, 400, 'INSERT_GOAL_ERROR');
      }

      return sendSuccess(res, calculateGoalMetrics(data), 'Savings goal created successfully', 201);
    }

    const newGoal: StoredGoal = {
      id: 'goal_' + Date.now(),
      user_id: userId,
      goal_name: goalName,
      target_amount: targetAmount,
      current_amount: currentAmount,
      target_date: targetDate,
      priority,
      created_at: new Date().toISOString(),
    };

    mockGoalsStore.unshift(newGoal);
    return sendSuccess(res, calculateGoalMetrics(newGoal), 'Savings goal created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create savings goal', 500, 'SERVER_ERROR');
  }
}

export async function updateSavingsGoal(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateGoalSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const updatePayload: Record<string, any> = {};
      if (updates.goalName !== undefined) updatePayload.goal_name = updates.goalName;
      if (updates.targetAmount !== undefined) updatePayload.target_amount = updates.targetAmount;
      if (updates.currentAmount !== undefined) updatePayload.current_amount = updates.currentAmount;
      if (updates.targetDate !== undefined) updatePayload.target_date = updates.targetDate;
      if (updates.priority !== undefined) updatePayload.priority = updates.priority;

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return sendError(res, 'Savings goal not found or update failed', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, calculateGoalMetrics(data), 'Savings goal updated');
    }

    const goal = mockGoalsStore.find((g) => g.id === id && g.user_id === userId);
    if (!goal) {
      return sendError(res, 'Savings goal not found', 404, 'NOT_FOUND');
    }

    if (updates.goalName !== undefined) goal.goal_name = updates.goalName;
    if (updates.targetAmount !== undefined) goal.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) goal.current_amount = updates.currentAmount;
    if (updates.targetDate !== undefined) goal.target_date = updates.targetDate;
    if (updates.priority !== undefined) goal.priority = updates.priority;

    const contribs = mockContributionsStore.filter((c) => c.goal_id === goal.id);
    return sendSuccess(res, calculateGoalMetrics(goal, contribs), 'Savings goal updated');
  } catch (err: any) {
    return sendError(res, 'Failed to update savings goal', 500, 'SERVER_ERROR');
  }
}

export async function deleteSavingsGoal(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return sendError(res, error.message, 400, 'DELETE_GOAL_ERROR');
      }
      return sendSuccess(res, { id }, 'Savings goal deleted successfully');
    }

    const initLen = mockGoalsStore.length;
    mockGoalsStore = mockGoalsStore.filter((g) => !(g.id === id && g.user_id === userId));

    if (mockGoalsStore.length === initLen) {
      return sendError(res, 'Savings goal not found', 404, 'NOT_FOUND');
    }

    mockContributionsStore = mockContributionsStore.filter((c) => c.goal_id !== id);
    return sendSuccess(res, { id }, 'Savings goal deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete savings goal', 500, 'SERVER_ERROR');
  }
}

export async function addGoalContribution(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = contributeGoalSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { amount, note } = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      // 1. Fetch current goal
      const { data: goal, error: gError } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (gError || !goal) {
        return sendError(res, 'Savings goal not found', 404, 'NOT_FOUND');
      }

      // 2. Insert contribution record
      const today = new Date().toISOString().split('T')[0];
      const { data: contrib, error: cError } = await supabase
        .from('savings_contributions')
        .insert({
          goal_id: id,
          amount,
          contribution_date: today,
          note: note || null,
        })
        .select()
        .single();

      if (cError) {
        return sendError(res, cError.message, 400, 'CONTRIB_INSERT_ERROR');
      }

      // 3. Update goal current amount
      const updatedAmount = Number(goal.current_amount) + amount;
      const { data: updatedGoal } = await supabase
        .from('savings_goals')
        .update({ current_amount: updatedAmount })
        .eq('id', id)
        .select('*, savings_contributions(*)')
        .single();

      return sendSuccess(
        res,
        calculateGoalMetrics(updatedGoal, updatedGoal?.savings_contributions || [contrib]),
        `Successfully contributed ₹${amount.toLocaleString()} to ${goal.goal_name}`,
        201
      );
    }

    // In-memory contribution
    const goal = mockGoalsStore.find((g) => g.id === id && g.user_id === userId);
    if (!goal) {
      return sendError(res, 'Savings goal not found', 404, 'NOT_FOUND');
    }

    goal.current_amount += amount;

    const newContrib: StoredContribution = {
      id: 'contrib_' + Date.now(),
      goal_id: id,
      amount,
      contribution_date: new Date().toISOString().split('T')[0],
      note,
      created_at: new Date().toISOString(),
    };

    mockContributionsStore.unshift(newContrib);
    const relatedContribs = mockContributionsStore.filter((c) => c.goal_id === id);

    return sendSuccess(
      res,
      calculateGoalMetrics(goal, relatedContribs),
      `Successfully contributed ₹${amount.toLocaleString()} to ${goal.goal_name}`,
      201
    );
  } catch (err: any) {
    return sendError(res, 'Failed to record contribution', 500, 'SERVER_ERROR');
  }
}

