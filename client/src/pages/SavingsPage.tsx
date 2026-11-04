import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, calculatePercentage, formatDate } from '../utils/formatters';
import { mockSavingsGoals } from '../data/mockData';
import { SavingsGoal } from '../types';
import { Target, Plus, PiggyBank, Calendar, Sparkles } from 'lucide-react';

interface SavingsPageProps {
  isDemoMode: boolean;
  currency?: string;
}

export const SavingsPage: React.FC<SavingsPageProps> = ({
  isDemoMode,
  currency = 'INR',
}) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(isDemoMode ? mockSavingsGoals : []);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [activeGoal, setActiveGoal] = useState<SavingsGoal | null>(null);

  // New Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Contribution Form State
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionNote, setContributionNote] = useState('');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: SavingsGoal = {
      id: 'sg_' + Date.now(),
      userId: 'usr_demo_7890',
      goalName: newGoalName,
      targetAmount: parseFloat(newTargetAmount) || 0,
      currentAmount: 0,
      targetDate: newTargetDate || undefined,
      priority: newPriority,
    };
    setGoals((prev) => [...prev, newGoal]);
    setIsAddGoalOpen(false);
    setNewGoalName('');
    setNewTargetAmount('');
  };

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGoal) return;
    const addAmt = parseFloat(contributionAmount) || 0;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === activeGoal.id
          ? { ...g, currentAmount: g.currentAmount + addAmt }
          : g
      )
    );

    setIsContributeOpen(false);
    setActiveGoal(null);
    setContributionAmount('');
  };

  const totalSavedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTargetAll = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Savings Goal Planner</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Set target funds, allocate monthly contributions, and track progress toward life milestones.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddGoalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Create New Goal
        </Button>
      </div>

      {/* Aggregate Overview Card */}
      <Card className="p-6 bg-gradient-to-r from-[#131B2E] via-slate-900 to-[#131B2E] border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Cumulative Savings Performance
            </span>
            <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
              {formatCurrency(totalSavedAll, currency)}
              <span className="text-sm font-normal text-slate-400 ml-2">
                saved of {formatCurrency(totalTargetAll, currency)} target
              </span>
            </div>
          </div>
          <Badge variant="emerald" size="md">
            {calculatePercentage(totalSavedAll, totalTargetAll)}% Overall Funded
          </Badge>
        </div>
        <div className="mt-4">
          <ProgressBar
            value={calculatePercentage(totalSavedAll, totalTargetAll)}
            variant="emerald"
            size="md"
          />
        </div>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const pct = calculatePercentage(goal.currentAmount, goal.targetAmount);
          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

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

                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {pct}%
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white mt-3">{goal.goalName}</h3>

                <div className="mt-2 text-xl font-bold font-mono text-white tabular-nums">
                  {formatCurrency(goal.currentAmount, currency)}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Target: {formatCurrency(goal.targetAmount, currency)}
                </div>

                <div className="mt-4">
                  <ProgressBar value={pct} variant="dynamic" size="md" />
                </div>
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
                  <span>Remaining:</span>
                  <span className="font-mono font-semibold text-slate-200">
                    {formatCurrency(remaining, currency)}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    setActiveGoal(goal);
                    setIsContributeOpen(true);
                  }}
                  leftIcon={<PiggyBank className="w-3.5 h-3.5 text-emerald-400" />}
                >
                  Deposit Funds
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      <Modal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        title="Create Savings Goal"
        description="Define a new target milestone with priority and completion date."
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Name"
            placeholder="e.g. Higher Education or Developer PC"
            value={newGoalName}
            onChange={(e) => setNewGoalName(e.target.value)}
            required
          />

          <Input
            label="Target Amount (₹)"
            type="number"
            placeholder="e.g. 150000"
            value={newTargetAmount}
            onChange={(e) => setNewTargetAmount(e.target.value)}
            required
          />

          <Input
            label="Target Date (Optional)"
            type="date"
            value={newTargetDate}
            onChange={(e) => setNewTargetDate(e.target.value)}
          />

          <Select
            label="Priority Level"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as any)}
            options={[
              { label: 'High Priority', value: 'high' },
              { label: 'Medium Priority', value: 'medium' },
              { label: 'Low Priority', value: 'low' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsAddGoalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
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
        description="Record a transfer or saved allocation toward this milestone."
      >
        <form onSubmit={handleAddContribution} className="space-y-4">
          <Input
            label="Contribution Amount (₹)"
            type="number"
            placeholder="e.g. 5000"
            value={contributionAmount}
            onChange={(e) => setContributionAmount(e.target.value)}
            required
          />

          <Input
            label="Deposit Note (Optional)"
            placeholder="e.g. November freelance bonus allocation"
            value={contributionNote}
            onChange={(e) => setContributionNote(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsContributeOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Deposit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
