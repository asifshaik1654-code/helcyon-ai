import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, calculatePercentage } from '../utils/formatters';
import { mockBudgets, mockTransactions } from '../data/mockData';
import { Budget, ExpenseCategory } from '../types';
import { PieChart, Plus, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

interface BudgetsPageProps {
  isDemoMode: boolean;
  currency?: string;
}

export const BudgetsPage: React.FC<BudgetsPageProps> = ({
  isDemoMode,
  currency = 'INR',
}) => {
  const [budgets, setBudgets] = useState<Budget[]>(isDemoMode ? mockBudgets : []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [amount, setAmount] = useState('10000');

  // Compute spent for each category dynamically from transactions
  const categorySpentMap: Record<string, number> = {};
  if (isDemoMode) {
    mockTransactions
      .filter((t) => t.transactionType === 'expense')
      .forEach((t) => {
        categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + t.amount;
      });
  }

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const newBudget: Budget = {
      id: 'b_' + Date.now(),
      userId: 'usr_demo_7890',
      category,
      budgetAmount: parseFloat(amount) || 0,
      budgetMonth: '2026-11',
    };
    setBudgets((prev) => [...prev, newBudget]);
    setIsModalOpen(false);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const totalPlanned = budgets.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = Object.values(categorySpentMap).reduce((sum, v) => sum + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Smart Budget Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure category-wise spending thresholds and monitor real-time adherence.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Set Category Budget
        </Button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Planned Limit</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalPlanned, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across {budgets.length} spending categories</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Actual Month Spend</span>
          <div className="text-2xl font-bold font-mono text-rose-400 mt-1 tabular-nums">
            {formatCurrency(totalSpent, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Sum of recorded expense transactions</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Unallocated Buffer</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {formatCurrency(Math.max(totalPlanned - totalSpent, 0), currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Remaining before hitting limit</p>
        </Card>
      </div>

      {/* Category Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const spent = categorySpentMap[b.category] || 0;
          const utilization = calculatePercentage(spent, b.budgetAmount);
          const remaining = b.budgetAmount - spent;
          const isWarning = utilization >= 80 && utilization < 100;
          const isOver = utilization >= 100;

          return (
            <Card key={b.id} className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">{b.category}</h4>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {formatCurrency(spent, currency)} spent of {formatCurrency(b.budgetAmount, currency)}
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
                    onClick={() => handleDeleteBudget(b.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                    title="Remove budget limit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <ProgressBar value={utilization} size="md" />

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">
                  {isOver ? 'Over budget by' : 'Remaining cushion:'}
                </span>
                <span
                  className={`font-mono font-bold ${
                    isOver ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {formatCurrency(Math.abs(remaining), currency)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Category Monthly Budget"
        description="Choose a category and specify the monthly spending limit."
      >
        <form onSubmit={handleAddBudget} className="space-y-4">
          <Select
            label="Expense Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={[
              { label: 'Food & Dining', value: 'Food & Dining' },
              { label: 'Housing', value: 'Housing' },
              { label: 'Groceries', value: 'Groceries' },
              { label: 'Transport', value: 'Transport' },
              { label: 'Utilities', value: 'Utilities' },
              { label: 'Entertainment', value: 'Entertainment' },
              { label: 'Education', value: 'Education' },
              { label: 'Shopping', value: 'Shopping' },
              { label: 'Healthcare', value: 'Healthcare' },
              { label: 'Technology', value: 'Technology' },
            ]}
          />

          <Input
            label="Monthly Limit Amount (₹)"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Budget
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

