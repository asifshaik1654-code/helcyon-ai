import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  suggestCategoryWithGemini,
  chatWithFinancialAssistant,
  FinancialContext,
} from '../services/geminiService.js';
import { getTransactionsByUser } from './transactionController.js';
import { mockBudgetsStore } from './dashboardController.js';
import { supabase, getSupabaseClient, isSupabaseLive } from '../config/supabase.js';

/**
 * Gathers user's verified financial context to ground the AI assistant in reality
 */
async function gatherUserFinancialContext(req: Request): Promise<FinancialContext> {
  const userId = req.user!.id;
  const currentMonth = new Date().toISOString().substring(0, 7);

  let transactions: any[] = [];
  let budgets: any[] = [];
  let goals: any[] = [];

  if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
    const db = getSupabaseClient(req.token);

    const [txRes, bgtRes, goalRes] = await Promise.all([
      db.from('transactions').select('*').eq('user_id', userId),
      db.from('budgets').select('*').eq('user_id', userId).eq('budget_month', currentMonth),
      db.from('savings_goals').select('*').eq('user_id', userId),
    ]);

    transactions = txRes.data || [];
    budgets = bgtRes.data || [];
    goals = goalRes.data || [];
  } else {
    transactions = getTransactionsByUser(userId);
    budgets = mockBudgetsStore.filter((b) => b.user_id === userId && b.budget_month === currentMonth);
    goals = [
      { goal_name: 'Emergency Safety Reserve', target_amount: 150000, current_amount: 95000 },
      { goal_name: 'MacBook Pro Development Rig', target_amount: 180000, current_amount: 120000 },
    ];
  }

  // Calculate Inflow & Outflow for current month
  const monthTx = transactions.filter((t) => {
    const d = t.transaction_date || t.transactionDate;
    return d && d.startsWith(currentMonth);
  });

  const monthInflow = monthTx
    .filter((t) => (t.transaction_type || t.transactionType) === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);

  const monthOutflow = monthTx
    .filter((t) => (t.transaction_type || t.transactionType) === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const availableBalance = monthInflow - monthOutflow;
  const savingsRate = monthInflow > 0 ? Number((((monthInflow - monthOutflow) / monthInflow) * 100).toFixed(1)) : 0;

  // Category breakdown
  const catMap: Record<string, number> = {};
  for (const t of monthTx) {
    if ((t.transaction_type || t.transactionType) === 'expense') {
      const c = t.category || 'Other';
      catMap[c] = (catMap[c] || 0) + Number(t.amount);
    }
  }

  const topCategories = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: monthOutflow > 0 ? Number(((amount / monthOutflow) * 100).toFixed(1)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Budget progress
  const budgetLimits = budgets.map((b) => {
    const limit = Number(b.budget_amount || b.budgetAmount || 0);
    const spent = catMap[b.category] || 0;
    const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const status = pct > 100 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
    return { category: b.category, limit, spent, status };
  });

  // Goals progress
  const goalItems = goals.map((g) => {
    const target = Number(g.target_amount || g.targetAmount || 0);
    const current = Number(g.current_amount || g.currentAmount || 0);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return { goalName: g.goal_name || g.goalName, target, current, progress };
  });

  const recentTransactions = transactions.slice(0, 5).map((t) => ({
    title: t.title,
    amount: Number(t.amount),
    type: t.transaction_type || t.transactionType,
    category: t.category,
    date: t.transaction_date || t.transactionDate,
  }));

  return {
    fullName: req.user?.fullName || 'Helcyon Member',
    currency: 'INR',
    monthInflow,
    monthOutflow,
    availableBalance,
    savingsRate,
    topCategories,
    budgetLimits,
    goals: goalItems,
    recentTransactions,
  };
}

export async function categorizeTransaction(req: Request, res: Response) {
  try {
    const { title, amount, description } = req.body;

    if (!title || typeof title !== 'string') {
      return sendError(res, 'Transaction title is required for category prediction', 400, 'VALIDATION_ERROR');
    }

    const suggestion = await suggestCategoryWithGemini(
      title,
      amount ? Number(amount) : undefined,
      description
    );

    return sendSuccess(res, suggestion);
  } catch (err: any) {
    console.error('[categorizeTransaction Error]:', err);
    return sendError(res, 'AI categorization failed', 500, 'SERVER_ERROR');
  }
}

export async function chatAssistant(req: Request, res: Response) {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 'Message text is required', 400, 'VALIDATION_ERROR');
    }

    const context = await gatherUserFinancialContext(req);
    const result = await chatWithFinancialAssistant(message, context, history || []);

    return sendSuccess(res, result);
  } catch (err: any) {
    console.error('[chatAssistant Error]:', err);
    return sendError(res, 'Financial assistant conversation failed', 500, 'SERVER_ERROR');
  }
}

export async function getFinancialInsights(req: Request, res: Response) {
  try {
    const context = await gatherUserFinancialContext(req);

    const insights = [
      {
        id: 'ins_1',
        title: 'Savings Efficiency Rate',
        description: `Your monthly savings rate is currently ${context.savingsRate}% with ₹${context.availableBalance.toLocaleString()} retained from total inflow.`,
        category: 'Savings',
        severity: context.savingsRate >= 30 ? 'info' : 'warning',
      },
      {
        id: 'ins_2',
        title: 'Dominant Outflow Driver',
        description: context.topCategories[0]
          ? `${context.topCategories[0].category} accounts for ${context.topCategories[0].percentage}% of total outflow (₹${context.topCategories[0].amount.toLocaleString()}).`
          : 'Record expense transactions to generate category spending insights.',
        category: 'Spending',
        severity: 'info',
      },
    ];

    return sendSuccess(res, { insights, contextSummary: context });
  } catch (err: any) {
    return sendError(res, 'Failed to fetch financial insights', 500, 'SERVER_ERROR');
  }
}

