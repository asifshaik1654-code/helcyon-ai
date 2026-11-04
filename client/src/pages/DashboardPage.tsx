import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  PieChart as PieIcon,
  Repeat,
  Plus,
  ArrowRight,
  Calendar,
  RefreshCw,
  AlertCircle
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
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { useDashboard } from '../hooks/useDashboard';

interface DashboardPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currency = 'INR',
}) => {
  const navigate = useNavigate();
  const { data, isLoading, error, selectedMonth, setSelectedMonth, refresh } = useDashboard();

  // Loading skeleton state
  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error Banner
  if (error && !data) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertCircle}
          title="Could Not Load Dashboard Analytics"
          description={`Server communication error: ${error}. Ensure your backend server is active.`}
          actionLabel="Retry Connection"
          onAction={() => refresh()}
        />
      </div>
    );
  }

  const summary = data!;
  const hasTransactions = summary.recentTransactions && summary.recentTransactions.length > 0;

  // Empty state when user has zero recorded transactions
  if (!hasTransactions && summary.totalIncome === 0 && summary.totalExpenses === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Wallet}
          title="No Financial Activity Recorded"
          description="Your financial ledger is currently empty. Start by logging your first transaction or importing a CSV file to generate charts and AI insights."
          actionLabel="Add First Transaction"
          onAction={() => navigate('/transactions')}
        />
      </div>
    );
  }

  const budget = summary.monthlyBudget;
  const remainingBudget = Math.max(0, budget.totalBudget - budget.totalSpent);

  return (
    <div className="space-y-6">
      {/* Top Header with Month Selector & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Financial Intelligence Dashboard</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated real-time metrics, cash flow trends, and intelligent observations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#0F1623] border border-slate-700 hover:border-slate-600 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            <option value="2026-11">November 2026</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh analytics"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/transactions')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Record
          </Button>
        </div>
      </div>

      {/* AI Insight Header Banner */}
      <AIInsightBanner observation={summary.observation} />

      {/* 4 Financial Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Inflow"
          amount={summary.totalIncome}
          currency={currency}
          trendPercentage={12.4}
          trendLabel="current month"
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Total Outflow"
          amount={summary.totalExpenses}
          currency={currency}
          trendPercentage={-3.2}
          trendLabel="current month"
          isPositiveTrendGood={false}
          icon={TrendingDown}
          variant="rose"
        />

        <StatCard
          title="Net Available Balance"
          amount={summary.availableBalance}
          currency={currency}
          trendPercentage={summary.savingsRate}
          trendLabel="savings rate"
          icon={Wallet}
          variant="cyan"
        />

        <StatCard
          title="Net Saved This Month"
          amount={summary.totalSaved}
          currency={currency}
          trendPercentage={summary.savingsRate}
          trendLabel="rate of retention"
          icon={PiggyBank}
          variant="amber"
        />
      </div>

      {/* Interactive Charts Section: Cash Flow & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bar Chart: 6-Month Income vs Expense */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Cash Flow & Trailing Trend</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Monthly income vs expense comparison computed from historical records
              </p>
            </div>
            <Badge variant="cyan" size="sm">
              6-Month Trailing View
            </Badge>
          </CardHeader>
          <CardContent>
            {summary.monthlyTrends && summary.monthlyTrends.length > 0 ? (
              <IncomeExpenseChart data={summary.monthlyTrends} currency={currency} />
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                Insufficient trend data to display monthly chart.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <PieIcon className="w-4 h-4 text-cyan-400" />
                <span>Spending by Category</span>
              </CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedMonth} Expense Distribution
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.topExpenseCategories && summary.topExpenseCategories.length > 0 ? (
              <>
                <CategoryPieChart data={summary.topExpenseCategories} currency={currency} />
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  {summary.topExpenseCategories.slice(0, 4).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-slate-300">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">{item.percentage}%</span>
                        <span className="font-mono font-medium text-slate-100">
                          {formatCurrency(item.amount, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-xs text-slate-500">
                No expense transactions logged for this month.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Row: Budget Adherence & Quick Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Overall Budget Utilization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Monthly Budget Utilization</CardTitle>
              <p className="text-xs text-slate-400 mt-0.5">
                Tracking {formatCurrency(budget.totalSpent, currency)} spent against{' '}
                {formatCurrency(budget.totalBudget, currency)} planned limits
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                budget.utilizationRate < 80
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : budget.utilizationRate <= 100
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {budget.utilizationRate}% Utilized
            </span>
          </CardHeader>
          <CardContent className="space-y-5">
            <ProgressBar
              value={budget.utilizationRate}
              variant={
                budget.utilizationRate < 80
                  ? 'emerald'
                  : budget.utilizationRate <= 100
                  ? 'amber'
                  : 'rose'
              }
              size="lg"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Total Spent</span>
                <div className="text-sm font-bold font-mono text-rose-400 mt-0.5">
                  {formatCurrency(budget.totalSpent, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Remaining Cushion</span>
                <div
                  className={`text-sm font-bold font-mono mt-0.5 ${
                    remainingBudget > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(remainingBudget, currency)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800">
                <span className="text-slate-400">Budget Status</span>
                <div
                  className={`text-sm font-bold font-mono mt-0.5 ${
                    budget.utilizationRate < 80
                      ? 'text-emerald-400'
                      : budget.utilizationRate <= 100
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {budget.utilizationRate < 80
                    ? 'Within Limit'
                    : budget.utilizationRate <= 100
                    ? 'Near Limit'
                    : 'Over Limit'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Configure planned limits by category</span>
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

        {/* Quick Actions & Navigation Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Repeat className="w-4 h-4 text-emerald-400" />
              <span>Financial Hub</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              onClick={() => navigate('/savings')}
              className="p-3.5 rounded-xl bg-[#0A0E17] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Savings Goals</div>
                  <div className="text-[11px] text-slate-400">Track and plan targets</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div
              onClick={() => navigate('/budgets')}
              className="p-3.5 rounded-xl bg-[#0A0E17] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Budget Planner</div>
                  <div className="text-[11px] text-slate-400">Category spending limits</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div
              onClick={() => navigate('/simulator')}
              className="p-3.5 rounded-xl bg-[#0A0E17] border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Scenario Simulator</div>
                  <div className="text-[11px] text-slate-400">Forecast financial changes</div>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table Widget */}
      <RecentTransactionsWidget transactions={summary.recentTransactions} currency={currency} />
    </div>
  );
};
