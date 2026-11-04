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
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Target,
  Plus,
  PiggyBank,
  Calendar,
  Sparkles,
  Trash2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { useSavingsGoals } from '../hooks/useSavingsGoals';
import type { SavingsGoalDetail } from '../services/savingsService';

interface SavingsPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

export const SavingsPage: React.FC<SavingsPageProps> = ({
  currency = 'INR',
}) => {
  const {
    goals,
    summary,
    isLoading,
    error,
    refresh,
    addGoal,
    removeGoal,
    contribute,
  } = useSavingsGoals();

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoalDetail | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newInitialAmount, setNewInitialAmount] = useState('0');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Contribution Form State
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNote, setContributionNote] = useState('');

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const target = parseFloat(newTargetAmount);
    const initial = parseFloat(newInitialAmount) || 0;

    if (isNaN(target) || target <= 0) {
      setFormError('Please enter a valid target amount greater than zero.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addGoal({
        goalName: newGoalName,
        targetAmount: target,
        currentAmount: initial,
        targetDate: newTargetDate || undefined,
        priority: newPriority,
      });
      setIsAddGoalOpen(false);
      setNewGoalName('');
      setNewTargetAmount('');
      setNewInitialAmount('0');
      setNewTargetDate('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to create savings goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    setFormError(null);
    const amt = parseFloat(contributionAmount);

    if (isNaN(amt) || amt <= 0) {
      setFormError('Please enter a valid positive deposit amount.');
      return;
    }

    try {
      setIsSubmitting(true);
      await contribute(activeGoal.id, amt, contributionNote || undefined);
      setIsContributeOpen(false);
      setActiveGoal(null);
      setContributionAmount('');
      setContributionNote('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to record contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteGoal = async () => {
    if (!deleteConfirmId) return;
    try {
      await removeGoal(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  };

  const totalSavedAll = summary?.totalSaved || 0;
  const totalTargetAll = summary?.totalTarget || 0;
  const overallProgress = summary?.overallProgress || 0;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Savings Goal Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set target funds, allocate monthly contributions, and track progress toward life milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh goals"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsAddGoalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create New Goal
          </Button>
        </div>
      </div>

      {/* Cumulative Overview Card */}
      <Card className="p-6 bg-gradient-to-r from-[#131B2E] via-slate-900 to-[#131B2E] border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Cumulative Savings Performance
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {isLoading ? (
                <Skeleton className="h-8 w-44" />
              ) : (
                <>
                  {formatCurrency(totalSavedAll, currency)}
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    saved of {formatCurrency(totalTargetAll, currency)} target
                  </span>
                </>
              )}
            </div>
          </div>
          <Badge variant="emerald" size="md">
            {overallProgress}% Overall Funded
          </Badge>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={overallProgress}
            variant="emerald"
            size="md"
          />
        </div>
      </Card>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-36" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-8 w-full mt-4" />
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={Target}
            title="No Savings Goals Established"
            description="Create your first financial milestone, such as an Emergency Safety Fund, Tuition, Laptop, or Travel target."
            actionLabel="Create First Goal"
            onAction={() => {
              setFormError(null);
              setIsAddGoalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const isCompleted = goal.isCompleted;

            return (
              <Card key={goal.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        goal.priority === 'high'
                          ? 'rose'
                          : goal.priority === 'medium'
                          ? 'cyan'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {goal.priority.toUpperCase()} PRIORITY
                    </Badge>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {goal.progressPercentage}%
                      </span>
                      <button
                        onClick={() => setDeleteConfirmId(goal.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mt-3 flex items-center gap-1.5">
                    {goal.goalName}
                    {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </h3>

                  <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
                    {formatCurrency(goal.currentAmount, currency)}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Target: {formatCurrency(goal.targetAmount, currency)}
                  </div>

                  <div className="mt-4">
                    <ProgressBar
                      value={goal.progressPercentage}
                      variant={isCompleted ? 'emerald' : 'cyan'}
                      size="md"
                    />
                  </div>

                  {/* AI Suggested Contribution Insight */}
                  {goal.suggestedMonthlyContribution > 0 && !isCompleted && (
                    <div className="mt-3 p-2.5 rounded-lg bg-[#0A0E17] border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        Suggested: <strong className="text-white font-mono">{formatCurrency(goal.suggestedMonthlyContribution, currency)}/mo</strong> for {goal.monthsRemaining} months to reach target.
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                  {goal.targetDate && (
                    <div className="flex items-center justify-between text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Target Date</span>
                      </span>
                      <span className="font-medium text-slate-200">
                        {formatDate(goal.targetDate, 'medium')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-slate-400">
                    <span>Remaining Cushion:</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {formatCurrency(goal.remainingAmount, currency)}
                    </span>
                  </div>

                  <Button
                    variant={isCompleted ? 'outline' : 'primary'}
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      setActiveGoal(goal);
                      setFormError(null);
                      setContributionAmount('');
                      setIsContributeOpen(true);
                    }}
                    leftIcon={<PiggyBank className="w-3.5 h-3.5" />}
                  >
                    {isCompleted ? 'Add Extra Surplus' : 'Deposit Funds'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal: Create Goal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title="Create Savings Goal"
        description="Define a new target milestone with priority and completion date."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Goal Name</label>
            <Input
              placeholder="e.g. Higher Education or Developer Rig"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Amount (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 150000"
                value={newTargetAmount}
                onChange={(e) => setNewTargetAmount(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Initial Saved Amount (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 20000"
                value={newInitialAmount}
                onChange={(e) => setNewInitialAmount(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Target Date (Optional)</label>
              <Input
                type="date"
                value={newTargetDate}
                onChange={(e) => setNewTargetDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Priority Level</label>
              <Select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                options={[
                  { label: 'High Priority', value: 'high' },
                  { label: 'Medium Priority', value: 'medium' },
                  { label: 'Low Priority', value: 'low' },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddGoalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Create Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Contribution */}
      <Modal
        isOpen={isContributeOpen}
        onClose={() => setIsContributeOpen(false)}
        title={`Add Deposit to ${activeGoal?.goalName || 'Goal'}`}
        description={`Record a transfer or saved allocation toward this milestone (Target: ${formatCurrency(
          activeGoal?.targetAmount || 0,
          currency
        )}).`}
      >
        <form onSubmit={handleAddContribution} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Deposit Amount (₹)</label>
            <Input
              type="number"
              placeholder="e.g. 5000"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Deposit Memo / Note (Optional)</label>
            <Input
              placeholder="e.g. November freelance bonus allocation"
              value={contributionNote}
              onChange={(e) => setContributionNote(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsContributeOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Confirm Deposit
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
                <h3 className="text-white font-semibold text-sm">Delete Savings Goal</h3>
                <p className="text-xs text-slate-400">All recorded contributions will be removed.</p>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to permanently delete this savings goal?
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
                onClick={handleDeleteGoal}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
