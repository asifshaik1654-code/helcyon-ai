import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  Repeat,
  Sparkles,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { AIInsightBanner } from '../components/dashboard/AIInsightBanner';
import { RecentTransactionsWidget } from '../components/dashboard/RecentTransactionsWidget';
import { IncomeExpenseChart } from '../components/charts/IncomeExpenseChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, calculatePercentage, formatDate } from '../utils/formatters';
import {
  mockTransactions,
  mockBudgets,
  mockSavingsGoals,
  mockRecurringPayments,
  mockMonthlyTrends
} from '../data/mockData';

interface DashboardPageProps {
  isDemoMode: boolean;
  currency: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  isDemoMode,
  currency = 'INR',
}) => {
  const navigate = useNavigate();

  // Dynamic state: If demo mode is active, use mock data; otherwise empty
  const transactions = isDemoMode ? mockTransactions : [];
  const budgets = isDemoMode ? mockBudgets : [];
  const savingsGoals = isDemoMode ? mockSavingsGoals : [];
  const recurringPayments = isDemoMode ? mockRecurringPayments : [];

  // Deterministic financial calculations
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter((t) => t.transactionType === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.transactionType === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const availableBalance = totalIncome - totalExpenses;

    const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const savingsTargetTotal = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

    // Category aggregation for Pie chart
    const categoryMap: Record<string, number> = {};
    transactions
      .filter((t) => t.transactionType === 'expense')
      .forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
      });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    // Budget utilization
    const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const budgetUtilizationPct = totalBudgetLimit > 0 ? calculatePercentage(totalExpenses, totalBudgetLimit) : 0;

    return {
      totalIncome,
      totalExpenses,
      availableBalance,
      totalSaved,
      savingsTargetTotal,
      savingsRate,
      categoryBreakdown,
      totalBudgetLimit,
      budgetUtilizationPct,
    };
  }, [transactions, budgets, savingsGoals]);

  // Empty state when user has no transactions
  if (transactions.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Wallet}
          title="No Financial Records Found"
          description="Your financial ledger is currently empty. Start by logging your first transaction, importing a CSV export from your bank, or enable Demo Mode in the sidebar to preview Helcyon AI with realistic data."
          actionLabel="Add First Transaction"
          onAction={() => navigate('/transactions')}
          secondaryActionLabel="Switch to Demo Mode"
          onSecondaryAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insight Header Banner */}
      <AIInsightBanner />

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inflow"
          amount={metrics.totalIncome}
          currency={currency}
          trendPercentage={10.1}
          trendLabel="vs last month"
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Total Outflow"
          amount={metrics.totalExpenses}
          currency={currency}
          trendPercentage={-4.9}
          trendLabel="vs last month"
          isPositiveTrendGood={false}
          icon={TrendingDown}
          variant="rose"
        />

        <StatCard
          title="Net Cash Surplus"
          amount={metrics.availableBalance}
          currency={currency}
          trendPercentage={21.8}
          trendLabel="disposable balance"
          icon={Wallet}
          variant="cyan"
        />

        <StatCard
          title="Savings Committed"
          amount={metrics.totalSaved}
          currency={currency}
          trendPercentage={metrics.savingsRate}
          trendLabel="current savings rate"
          icon={PiggyBank}
          variant="amber"
        />
      </div>

      {/* Charts Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Income vs Expense 6-Month Comparison */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Cash Flow & Trailing Trend</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly income vs expense comparison for the past 6 billing cycles
              </p>
            </div>
            <Badge variant="cyan" size="sm">
              6-Month View
            </Badge>
          </CardHeader>
          <CardContent>
            <IncomeExpenseChart data={mockMonthlyTrends} currency={currency} />
          </CardContent>
        </Card>

        {/* Expense Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <PieIcon className="w-4 h-4 text-cyan-400" />
                <span>Spending by Category</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">November 2026 Distribution</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategoryPieChart data={metrics.categoryBreakdown} currency={currency} />

            {/* Top 3 categories list */}
            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
              {metrics.categoryBreakdown.slice(0, 3).map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <span className="text-slate-300">{item.category}</span>
                  <span className="font-mono font-medium text-slate-100">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Budget Adherence & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Overall Budget Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Budget Utilization</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracking {formatCurrency(metrics.totalExpenses, currency)} spent against{' '}
                {formatCurrency(metrics.totalBudgetLimit, currency)} planned limit
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                metrics.budgetUtilizationPct < 80
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {metrics.budgetUtilizationPct}% Used
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressBar value={metrics.budgetUtilizationPct} size="lg" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Total Spent</span>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  {formatCurrency(metrics.totalExpenses, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Remaining Cushion</span>
                <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                  {formatCurrency(metrics.totalBudgetLimit - metrics.totalExpenses, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Month Days Left</span>
                <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                  17 Days
                </div>
              </div>
            </div>

            {/* Quick Link to Budgets */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">8 Category limits configured</span>
              <button
                onClick={() => navigate('/budgets')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Manage Category Budgets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Recurring Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Repeat className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Recurring</span>
            </CardTitle>
            <button
              onClick={() => navigate('/recurring')}
              className="text-xs text-slate-400 hover:text-white"
            >
              All
            </button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800/60">
            {recurringPayments.slice(0, 4).map((sub) => (
              <div
                key={sub.id}
                className="p-3.5 px-5 flex items-center justify-between hover:bg-slate-800/20 text-xs transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-200">{sub.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>Due {formatDate(sub.nextPaymentDate, 'short')}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-slate-100">
                    {formatCurrency(sub.amount, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {sub.frequency}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <RecentTransactionsWidget transactions={transactions} currency={currency} />
    </div>
  );
};
