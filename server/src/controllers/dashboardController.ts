import { Request, Response } from 'express';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { dashboardQuerySchema } from '../schemas/dashboardSchema.js';
import { getTransactionsByUser, StoredTransaction } from './transactionController.js';

// In-memory mock budgets store reference (shared with budgetController)
export interface StoredBudget {
  id: string;
  user_id: string;
  category: string;
  budget_amount: number;
  budget_month: string; // YYYY-MM
  created_at: string;
}

export let mockBudgetsStore: StoredBudget[] = [
  {
    id: 'bgt_demo_01',
    user_id: '00000000-0000-0000-0000-000000000001',
    category: 'Housing',
    budget_amount: 25000,
    budget_month: '2026-11',
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'bgt_demo_02',
    user_id: '00000000-0000-0000-0000-000000000001',
    category: 'Groceries',
    budget_amount: 8000,
    budget_month: '2026-11',
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'bgt_demo_03',
    user_id: '00000000-0000-0000-0000-000000000001',
    category: 'Food & Dining',
    budget_amount: 5000,
    budget_month: '2026-11',
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'bgt_demo_04',
    user_id: '00000000-0000-0000-0000-000000000001',
    category: 'Transport',
    budget_amount: 4000,
    budget_month: '2026-11',
    created_at: '2026-11-01T00:00:00Z',
  },
  {
    id: 'bgt_demo_05',
    user_id: '00000000-0000-0000-0000-000000000001',
    category: 'Entertainment',
    budget_amount: 3000,
    budget_month: '2026-11',
    created_at: '2026-11-01T00:00:00Z',
  },
];

export async function getDashboardSummary(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = dashboardQuerySchema.safeParse(req.query);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const currentYearMonth =
      parseResult.data.month || new Date().toISOString().substring(0, 7); // '2026-11'

    let transactions: any[] = [];
    let budgets: any[] = [];

    // 1. Fetch Transactions & Budgets
    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });

      if (txError) {
        return sendError(res, txError.message, 400, 'TX_FETCH_ERROR');
      }
      transactions = txData || [];

      const { data: bgtData } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('budget_month', currentYearMonth);
      budgets = bgtData || [];
    } else {
      transactions = getTransactionsByUser(userId);
      budgets = mockBudgetsStore.filter(
        (b) => b.user_id === userId && b.budget_month === currentYearMonth
      );
    }

    // 2. Compute Core Financial Metrics
    // Filter transactions for selected month or full period
    const monthTransactions = transactions.filter((t) => {
      const txDate = t.transaction_date || t.transactionDate;
      return txDate && txDate.startsWith(currentYearMonth);
    });

    // Income & Expense totals (for the month)
    const monthIncome = monthTransactions
      .filter((t) => (t.transaction_type || t.transactionType) === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthExpenses = monthTransactions
      .filter((t) => (t.transaction_type || t.transactionType) === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Lifetime balance from all recorded transactions
    const totalLifetimeIncome = transactions
      .filter((t) => (t.transaction_type || t.transactionType) === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalLifetimeExpenses = transactions
      .filter((t) => (t.transaction_type || t.transactionType) === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const availableBalance = totalLifetimeIncome - totalLifetimeExpenses;
    const netMonthSavings = Math.max(0, monthIncome - monthExpenses);
    const savingsRate = monthIncome > 0 ? Number(((netMonthSavings / monthIncome) * 100).toFixed(1)) : 0;

    // 3. Monthly Budget Utilization
    const totalBudget = budgets.reduce((sum, b) => sum + Number(b.budget_amount || b.budgetAmount), 0);
    const budgetUtilizationRate =
      totalBudget > 0 ? Number(((monthExpenses / totalBudget) * 100).toFixed(1)) : 0;

    // 4. Top Expense Categories Breakdown
    const expenseCategoryMap: Record<string, number> = {};
    for (const t of monthTransactions) {
      if ((t.transaction_type || t.transactionType) === 'expense') {
        const cat = t.category || 'Other';
        expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + Number(t.amount);
      }
    }

    const topExpenseCategories = Object.entries(expenseCategoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: monthExpenses > 0 ? Number(((amount / monthExpenses) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 5. Monthly Trends (Last 6 Months: Aggregated from all transactions)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendMap: Record<string, { income: number; expenses: number }> = {};

    // Generate month slots for the past 6 months up to current
    const dateObj = new Date(currentYearMonth + '-01');
    const pastMonths: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(dateObj.getFullYear(), dateObj.getMonth() - i, 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${yyyy}-${mm}`;
      pastMonths.push(key);
      trendMap[key] = { income: 0, expenses: 0 };
    }

    // Populate actual amounts from recorded transactions
    for (const t of transactions) {
      const txDate = t.transaction_date || t.transactionDate;
      if (!txDate) continue;
      const key = txDate.substring(0, 7);
      if (trendMap[key]) {
        const amt = Number(t.amount);
        if ((t.transaction_type || t.transactionType) === 'income') {
          trendMap[key].income += amt;
        } else {
          trendMap[key].expenses += amt;
        }
      }
    }

    const monthlyTrends = pastMonths.map((key) => {
      const [yearStr, monthStr] = key.split('-');
      const mIdx = parseInt(monthStr, 10) - 1;
      const label = `${monthNames[mIdx]} '${yearStr.slice(2)}`;
      const inc = trendMap[key].income;
      const exp = trendMap[key].expenses;
      return {
        month: label,
        rawMonth: key,
        income: inc,
        expenses: exp,
        savings: Math.max(0, inc - exp),
      };
    });

    // 6. Recent Transactions (Latest 5)
    const recentTransactions = transactions
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        userId: t.user_id || t.userId,
        title: t.title,
        amount: Number(t.amount),
        transactionType: t.transaction_type || t.transactionType,
        category: t.category,
        transactionDate: t.transaction_date || t.transactionDate,
        paymentMethod: t.payment_method || t.paymentMethod,
        description: t.description || undefined,
        isRecurring: t.is_recurring ?? t.isRecurring ?? false,
      }));

    // 7. Dynamic Observations / Insight
    let observation = 'Financial data is healthy. Record more transactions to unlock deeper AI analysis.';
    if (topExpenseCategories.length > 0) {
      const top = topExpenseCategories[0];
      observation = `Your largest spending category this month is ${top.category} at ₹${top.amount.toLocaleString()} (${top.percentage}% of total expenses).`;
    }

    return sendSuccess(res, {
      selectedMonth: currentYearMonth,
      totalIncome: monthIncome,
      totalExpenses: monthExpenses,
      availableBalance,
      totalSaved: netMonthSavings,
      savingsRate,
      monthlyBudget: {
        totalBudget,
        totalSpent: monthExpenses,
        utilizationRate: budgetUtilizationRate,
        isOverBudget: monthExpenses > totalBudget && totalBudget > 0,
      },
      recentTransactions,
      topExpenseCategories,
      monthlyTrends,
      observation,
    });
  } catch (err: any) {
    console.error('[getDashboardSummary Error]:', err);
    return sendError(res, 'Failed to compute dashboard analytics', 500, 'SERVER_ERROR');
  }
}
