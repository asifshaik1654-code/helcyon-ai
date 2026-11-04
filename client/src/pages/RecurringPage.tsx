import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RecurringPayment, ExpenseCategory } from '../types';
import {
  Repeat,
  Plus,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  Check,
  X,
  RefreshCw,
  Sparkles,
  TrendingDown
} from 'lucide-react';
import * as recurringService from '../services/recurringService';

interface RecurringPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Utilities',
  'Housing',
  'Entertainment',
  'Technology',
  'Personal Care',
  'Food & Dining',
  'Education',
  'Healthcare',
  'Investments',
  'Other',
];

export const RecurringPage: React.FC<RecurringPageProps> = ({
  currency = 'INR',
}) => {
  const [data, setData] = useState<recurringService.RecurringResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRecurring = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await recurringService.getRecurringPayments();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch recurring subscriptions';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecurring();
  }, [fetchRecurring]);

  const handleConfirmDetected = async (sub: RecurringPayment) => {
    try {
      await recurringService.confirmRecurringPayment(sub.id, sub);
      await fetchRecurring();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to confirm recurring payment');
    }
  };

  const handleDismissDetected = async (id: string) => {
    try {
      await recurringService.dismissRecurringPayment(id);
      await fetchRecurring();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to dismiss recurring payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring subscription?')) return;
    try {
      await recurringService.deleteRecurringPayment(id);
      await fetchRecurring();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete payment');
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const parsedAmount = parseFloat(amount);

    if (!title.trim()) {
      setFormError('Please enter a subscription title.');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    try {
      setIsSaving(true);
      await recurringService.createRecurringPayment({
        title: title.trim(),
        amount: parsedAmount,
        category,
        frequency,
        nextPaymentDate: nextDate,
        status: 'active',
      });
      setIsAddModalOpen(false);
      setTitle('');
      setAmount('');
      await fetchRecurring();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save recurring subscription');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmedPayments = data?.confirmed || [];
  const detectedPayments = data?.detected || [];
  const totalMonthlyOutflow = data?.totalMonthlyOutflow || 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Recurring Payment Intelligence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify regular subscriptions, forecast upcoming auto-debits, and manage scheduled commitments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchRecurring()}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            title="Refresh"
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Recurring Bill
          </Button>
        </div>
      </div>

      {/* Overview Stat Card */}
      <Card className="p-5 bg-gradient-to-r from-[#131B2E] via-slate-900 to-[#131B2E] border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">
                Total Committed Monthly Outflow
              </span>
              <div className="text-2xl font-bold font-mono text-white mt-0.5 tabular-nums">
                {isLoading ? (
                  <Skeleton className="h-8 w-32" />
                ) : (
                  formatCurrency(totalMonthlyOutflow, currency)
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="md">
              {confirmedPayments.length} Active Subscriptions
            </Badge>
            {detectedPayments.length > 0 && (
              <Badge variant="amber" size="md">
                {detectedPayments.length} Pending Review
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Auto-Detected Candidates Banner / Section (Module 7) */}
      {detectedPayments.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2 text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <CardTitle className="text-amber-200">
                AI Detected Potential Recurring Outflows ({detectedPayments.length})
              </CardTitle>
            </div>
            <p className="text-xs text-slate-400">
              We identified repeated transactions matching regular monthly intervals. Confirm to track them.
            </p>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-800/60">
            {detectedPayments.map((sub) => (
              <div
                key={sub.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
              >
                <div>
                  <div className="font-semibold text-slate-100 flex items-center gap-2 text-sm">
                    <span>{sub.title}</span>
                    <Badge variant="slate" size="sm">
                      {sub.category}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      Estimated Next: {formatDate(sub.nextPaymentDate, 'medium')}
                    </span>
                    <span>• Pattern: {sub.frequency}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono font-bold text-sm text-white">
                    {formatCurrency(sub.amount, currency)}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirmDetected(sub)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissDetected(sub.id)}
                    leftIcon={<X className="w-3.5 h-3.5 text-slate-400" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirmed Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Repeat className="w-4 h-4 text-emerald-400" />
            <span>Active Recurring Commitments ({confirmedPayments.length})</span>
          </CardTitle>
          <span className="text-xs text-slate-400">
            Explicitly confirmed recurring expenses
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-800/60 p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : confirmedPayments.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={Repeat}
                title="No Recurring Bills Configured"
                description="Add recurring payments like rent, internet, electricity, or subscriptions to receive proactive payment alerts."
                actionLabel="Add Recurring Bill"
                onAction={() => {
                  setFormError(null);
                  setIsAddModalOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0E17]/60 text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Title & Provider</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Frequency</th>
                    <th className="p-3.5">Next Estimated Date</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {confirmedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="p-3.5 pl-6 font-semibold text-slate-100">{p.title}</td>
                      <td className="p-3.5">
                        <Badge variant="slate" size="sm">
                          {p.category}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-slate-300 capitalize">{p.frequency}</td>
                      <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                        {formatDate(p.nextPaymentDate, 'medium')}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-100">
                        {formatCurrency(p.amount, currency)}
                      </td>
                      <td className="p-3.5 pr-6 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                          title="Remove subscription"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Subscription Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Recurring Payment"
        description="Schedule an ongoing expense with frequency and next due date."
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Title</label>
            <Input
              placeholder="e.g. Broadband Fiber Wi-Fi"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Amount (₹)</label>
              <Input
                type="number"
                placeholder="e.g. 1199"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Category</label>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Frequency</label>
              <Select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                options={[
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Yearly', value: 'yearly' },
                ]}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">Next Estimated Payment</label>
              <Input
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSaving}>
              Save Recurring Bill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
