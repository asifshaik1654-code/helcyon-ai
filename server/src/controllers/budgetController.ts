import { Request, Response } from 'express';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createBudgetSchema,
  updateBudgetSchema,
  queryBudgetSchema,
} from '../schemas/budgetSchema.js';
import { getTransactionsByUser } from './transactionController.js';
import { mockBudgetsStore, StoredBudget } from './dashboardController.js';

export async function getBudgets(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = queryBudgetSchema.safeParse(req.query);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const month = parseResult.data.month || new Date().toISOString().substring(0, 7);

    let budgetRecords: any[] = [];
    let transactions: any[] = [];

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data: bData, error: bError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('budget_month', month);

      if (bError) {
        return sendError(res, bError.message, 400, 'BUDGET_FETCH_ERROR');
      }
      budgetRecords = bData || [];

      const { data: tData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense');

      transactions = tData || [];
    } else {
      budgetRecords = mockBudgetsStore.filter(
        (b) => b.user_id === userId && b.budget_month === month
      );
      transactions = getTransactionsByUser(userId);
    }

    // Filter transactions to matching month
    const monthExpenses = transactions.filter((t) => {
      const d = t.transaction_date || t.transactionDate;
      const type = t.transaction_type || t.transactionType;
      return d && d.startsWith(month) && type === 'expense';
    });

    // Compute category spent totals
    const categorySpentMap: Record<string, number> = {};
    for (const t of monthExpenses) {
      const cat = t.category || 'Other';
      categorySpentMap[cat] = (categorySpentMap[cat] || 0) + Number(t.amount);
    }

    // Map each budget record with real utilization metrics
    const budgetProgress = budgetRecords.map((b) => {
      const budgetAmount = Number(b.budget_amount ?? b.budgetAmount);
      const category = b.category;
      const spent = categorySpentMap[category] || 0;
      const remaining = budgetAmount - spent;
      const utilizationPercentage =
        budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(1)) : 0;

      let status: 'safe' | 'warning' | 'danger' = 'safe';
      if (utilizationPercentage > 100) {
        status = 'danger';
      } else if (utilizationPercentage >= 80) {
        status = 'warning';
      }

      return {
        id: b.id,
        userId: b.user_id || b.userId,
        category,
        budgetAmount,
        budgetMonth: b.budget_month || b.budgetMonth,
        spent,
        remaining,
        utilizationPercentage,
        status,
        createdAt: b.created_at || b.createdAt,
      };
    });

    // Summary totals
    const totalBudget = budgetProgress.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = budgetProgress.reduce((sum, b) => sum + b.spent, 0);
    const overallUtilization =
      totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    return sendSuccess(res, {
      month,
      budgets: budgetProgress,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining: totalBudget - totalSpent,
        overallUtilization,
        safeCount: budgetProgress.filter((b) => b.status === 'safe').length,
        warningCount: budgetProgress.filter((b) => b.status === 'warning').length,
        dangerCount: budgetProgress.filter((b) => b.status === 'danger').length,
      },
    });
  } catch (err: any) {
    console.error('[getBudgets Error]:', err);
    return sendError(res, 'Failed to fetch budget progress', 500, 'SERVER_ERROR');
  }
}

export async function getBudgetAlerts(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);

    let budgetRecords: any[] = [];
    let transactions: any[] = [];

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data: bData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('budget_month', month);
      budgetRecords = bData || [];

      const { data: tData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense');
      transactions = tData || [];
    } else {
      budgetRecords = mockBudgetsStore.filter(
        (b) => b.user_id === userId && b.budget_month === month
      );
      transactions = getTransactionsByUser(userId);
    }

    const monthExpenses = transactions.filter((t) => {
      const d = t.transaction_date || t.transactionDate;
      const type = t.transaction_type || t.transactionType;
      return d && d.startsWith(month) && type === 'expense';
    });

    const categorySpentMap: Record<string, number> = {};
    for (const t of monthExpenses) {
      const cat = t.category || 'Other';
      categorySpentMap[cat] = (categorySpentMap[cat] || 0) + Number(t.amount);
    }

    const alerts: Array<{
      category: string;
      status: 'warning' | 'danger';
      budgetAmount: number;
      spent: number;
      utilizationPercentage: number;
      message: string;
    }> = [];

    for (const b of budgetRecords) {
      const budgetAmount = Number(b.budget_amount ?? b.budgetAmount);
      const category = b.category;
      const spent = categorySpentMap[category] || 0;
      const pct = budgetAmount > 0 ? Number(((spent / budgetAmount) * 100).toFixed(1)) : 0;

      if (pct > 100) {
        alerts.push({
          category,
          status: 'danger',
          budgetAmount,
          spent,
          utilizationPercentage: pct,
          message: `Budget Exceeded: You have spent ₹${spent.toLocaleString()} on ${category}, which is ${pct}% of your planned ₹${budgetAmount.toLocaleString()} limit (₹${(spent - budgetAmount).toLocaleString()} over limit).`,
        });
      } else if (pct >= 80) {
        alerts.push({
          category,
          status: 'warning',
          budgetAmount,
          spent,
          utilizationPercentage: pct,
          message: `Threshold Warning: You have utilized ${pct}% of your ${category} budget (₹${spent.toLocaleString()} of ₹${budgetAmount.toLocaleString()}). Only ₹${(budgetAmount - spent).toLocaleString()} remains for this month.`,
        });
      }
    }

    return sendSuccess(res, { alerts });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch budget alerts', 500, 'SERVER_ERROR');
  }
}

export async function createBudget(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = createBudgetSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { category, budgetAmount, budgetMonth } = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('budgets')
        .upsert(
          {
            user_id: userId,
            category,
            budget_amount: budgetAmount,
            budget_month: budgetMonth,
          },
          { onConflict: 'user_id,category,budget_month' }
        )
        .select()
        .single();

      if (error) {
        return sendError(res, error.message, 400, 'INSERT_ERROR');
      }

      return sendSuccess(res, data, 'Budget limit saved successfully', 201);
    }

    // In-memory update or insert
    const existingIndex = mockBudgetsStore.findIndex(
      (b) => b.user_id === userId && b.category === category && b.budget_month === budgetMonth
    );

    if (existingIndex >= 0) {
      mockBudgetsStore[existingIndex].budget_amount = budgetAmount;
      return sendSuccess(res, mockBudgetsStore[existingIndex], 'Budget limit updated successfully', 200);
    }

    const newBudget: StoredBudget = {
      id: 'bgt_' + Date.now(),
      user_id: userId,
      category,
      budget_amount: budgetAmount,
      budget_month: budgetMonth,
      created_at: new Date().toISOString(),
    };
    mockBudgetsStore.push(newBudget);

    return sendSuccess(res, newBudget, 'Budget limit created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to save budget limit', 500, 'SERVER_ERROR');
  }
}

export async function updateBudget(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateBudgetSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { budgetAmount } = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data, error } = await supabase
        .from('budgets')
        .update({ budget_amount: budgetAmount })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return sendError(res, 'Budget not found or update failed', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, data, 'Budget limit updated');
    }

    const found = mockBudgetsStore.find((b) => b.id === id && b.user_id === userId);
    if (!found) {
      return sendError(res, 'Budget not found', 404, 'NOT_FOUND');
    }

    found.budget_amount = budgetAmount;
    return sendSuccess(res, found, 'Budget limit updated');
  } catch (err: any) {
    return sendError(res, 'Failed to update budget limit', 500, 'SERVER_ERROR');
  }
}

export async function deleteBudget(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return sendError(res, error.message, 400, 'DELETE_ERROR');
      }
      return sendSuccess(res, { id }, 'Budget limit removed');
    }

    const idx = mockBudgetsStore.findIndex((b) => b.id === id && b.user_id === userId);
    if (idx === -1) {
      return sendError(res, 'Budget not found', 404, 'NOT_FOUND');
    }

    mockBudgetsStore.splice(idx, 1);
    return sendSuccess(res, { id }, 'Budget limit removed');
  } catch (err: any) {
    return sendError(res, 'Failed to remove budget limit', 500, 'SERVER_ERROR');
  }
}
