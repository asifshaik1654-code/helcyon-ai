import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency } from '../utils/formatters';
import { ExpenseCategory } from '../types';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Edit2,
  Calendar
} from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';

interface BudgetsPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Housing',
  'Food & Dining',
  'Groceries',
  'Transport',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Education',
  'Technology',
  'Personal Care',
  'Travel',
  'Investments',
  'Other',
];

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  currency = 'INR',
}) => {
  const {
    data,
    alerts,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    refresh,
    saveBudget,
    removeBudget,
  } = useBudgets();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>('Food & Dining');
  const [amount, setAmount] = useState('10000');
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAddModal = (cat?: ExpenseCategory, existingAmt?: number) => {
    setSelectedCategory(cat || 'Food & Dining');
    setAmount(existingAmt ? String(existingAmt) : '10000');
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setActionError('Please enter a valid positive budget amount.');
      return;
    }

    try {
      setIsSaving(true);
      await saveBudget(selectedCategory, parsedAmount);
      setIsModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save budget limit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!deleteConfirmId) return;
    try {
      await removeBudget(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to remove budget');
    }
  };

  const budgets = data?.budgets || [];
  const summary = data?.summary || {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallUtilization: 0,
    safeCount: 0,
    warningCount: 0,
    dangerCount: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with Month Selector & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Smart Budget Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure category-wise spending thresholds and monitor real-time adherence.
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
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh budgets"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAddModal()}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Set Category Budget
          </Button>
        </div>
      </div>

      {/* Threshold Alerts Banner (Module 5 Specification) */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                alert.status === 'danger'
                  ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alert.status === 'danger' ? 'text-rose-400' : 'text-amber-400'
                }`}
              />
              <div className="flex-1">
                <span className="font-semibold">{alert.category}: </span>
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Planned Limit</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-28" /> : formatCurrency(summary.totalBudget, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across {budgets.length} configured categories</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Actual Month Spend</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {isLoading ? <Skeleton className="h-8 w-28" /> : formatCurrency(summary.totalSpent, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sum of recorded expense transactions</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Unallocated Buffer</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 tabular-nums ${
              summary.totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              formatCurrency(Math.max(summary.totalRemaining, 0), currency)
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {summary.totalRemaining >= 0
              ? 'Remaining before hitting monthly limits'
              : `Exceeded by ${formatCurrency(Math.abs(summary.totalRemaining), currency)}`}
          </p>
        </Card>
      </div>

      {/* Category Budgets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-40" />
            </Card>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={PieChart}
            title="No Category Budgets Configured"
            description="Set monthly spending limits for categories such as Food & Dining, Groceries, or Utilities to track expenses automatically."
            actionLabel="Set First Budget"
            onAction={() => handleOpenAddModal()}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isWarning = b.status === 'warning';
            const isOver = b.status === 'danger';

            return (
              <Card key={b.id} className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{b.category}</h4>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatCurrency(b.spent, currency)} spent of {formatCurrency(b.budgetAmount, currency)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isOver ? 'rose' : isWarning ? 'amber' : 'emerald'}
                      size="sm"
                    >
                      {isOver ? 'Exceeded' : isWarning ? 'Near Limit' : 'On Track'}
                    </Badge>

                    <button
                      onClick={() => handleOpenAddModal(b.category, b.budgetAmount)}
                      className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Edit budget limit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(b.id)}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Remove budget limit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <ProgressBar
                  value={b.utilizationPercentage}
                  variant={isOver ? 'rose' : isWarning ? 'amber' : 'emerald'}
                  size="md"
                />

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">
                    {isOver ? 'Over limit by:' : 'Remaining cushion:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      ({b.utilizationPercentage}% used)
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isOver ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(Math.abs(b.remaining), currency)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Category Budget Limit"
        description={`Configure planned monthly expense limit for ${selectedMonth}.`}
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          {actionError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Expense Category</label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory)}
              options={CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Monthly Budget Amount (₹)</label>
            <Input
              type="number"
              placeholder="e.g. 12000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
            >
              Save Budget Limit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F1623] border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-900/30 rounded-lg text-rose-400">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Remove Budget Limit</h3>
                <p className="text-xs text-slate-400">This category will no longer track limits.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to remove this category budget? Past transactions will remain intact.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                onClick={handleDeleteBudget}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
