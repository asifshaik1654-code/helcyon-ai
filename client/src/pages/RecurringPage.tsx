import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { formatCurrency, formatDate } from '../utils/formatters';
import { mockRecurringPayments } from '../data/mockData';
import { RecurringPayment, ExpenseCategory } from '../types';
import { Repeat, Plus, Calendar, CheckCircle, AlertCircle, Trash2, Check, X } from 'lucide-react';

interface RecurringPageProps {
  isDemoMode: boolean;
  currency?: string;
}

export const RecurringPage: React.FC<RecurringPageProps> = ({
  isDemoMode,
  currency = 'INR',
}) => {
  const [payments, setPayments] = useState<RecurringPayment[]>(
    isDemoMode ? mockRecurringPayments : []
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Utilities');
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');
  const [nextDate, setNextDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );

  const detectedPayments = payments.filter((p) => !p.isUserConfirmed);
  const confirmedPayments = payments.filter((p) => p.isUserConfirmed);

  const handleConfirmDetected = (id: string) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isUserConfirmed: true } : p))
    );
  };

  const handleDismissDetected = (id: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: RecurringPayment = {
      id: 'rec_' + Date.now(),
      userId: 'usr_demo_7890',
      title,
      amount: parseFloat(amount) || 0,
      category,
      frequency: frequency as any,
      nextPaymentDate: nextDate,
      status: 'active',
      isUserConfirmed: true,
    };
    setPayments((prev) => [...prev, newPayment]);
    setIsAddModalOpen(false);
    setTitle('');
    setAmount('');
  };

  const totalMonthlyRecurring = confirmedPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Recurring Payment Intelligence</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Identify repeated bills, monitor upcoming subscription dues, and confirm automatic detections.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-3.5 h-3.5" />}
        >
          Add Recurring Bill
        </Button>
      </div>

      {/* Detected Payments Banner (Module 7 Requirement) */}
      {detectedPayments.length > 0 && (
        <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-white">
              Potential Recurring Subscriptions Detected ({detectedPayments.length})
            </h4>
          </div>
          <p className="text-xs text-slate-300">
            Helcyon analyzed your transaction patterns and found repeated charges. Please confirm or dismiss:
          </p>

          <div className="space-y-2">
            {detectedPayments.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-[#131B2E] border border-slate-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-white">{p.title}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Charged {formatCurrency(p.amount, currency)} • Frequency: {p.frequency}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirmDetected(p.id)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Confirm Subscription
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDismissDetected(p.id)}
                    leftIcon={<X className="w-3.5 h-3.5 text-slate-400" />}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Monthly Fixed Commitments</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {formatCurrency(totalMonthlyRecurring, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across {confirmedPayments.length} confirmed subscriptions & bills</p>
        </Card>

        <Card className="p-5">
          <span className="text-xs text-slate-400 uppercase font-semibold">Next Upcoming Due</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1 tabular-nums">
            {confirmedPayments.length > 0 ? formatDate(confirmedPayments[0].nextPaymentDate, 'short') : 'None'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {confirmedPayments.length > 0 ? confirmedPayments[0].title : 'No upcoming payments'}
          </p>
        </Card>
      </div>

      {/* Confirmed Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Repeat className="w-4 h-4 text-emerald-400" />
            <span>Active Confirmed Subscriptions ({confirmedPayments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A0E17]/60 text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 pl-6">Subscription / Bill</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Frequency</th>
                  <th className="p-3.5">Next Due Date</th>
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
                    <td className="p-3.5 capitalize text-slate-300">{p.frequency}</td>
                    <td className="p-3.5 font-mono text-cyan-400">
                      {formatDate(p.nextPaymentDate, 'medium')}
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-100 tabular-nums">
                      {formatCurrency(p.amount, currency)}
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <button
                        onClick={() => handleDismissDetected(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                        title="Delete recurring payment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Add Recurring Bill */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Recurring Commitment"
        description="Schedule a known fixed expense such as rent, broadband, or subscription."
      >
        <form onSubmit={handleAddPayment} className="space-y-4">
          <Input
            label="Title / Merchant"
            placeholder="e.g. Apartment Rent or Spotify"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Amount (₹)"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            options={[
              { label: 'Housing', value: 'Housing' },
              { label: 'Utilities', value: 'Utilities' },
              { label: 'Entertainment', value: 'Entertainment' },
              { label: 'Technology', value: 'Technology' },
              { label: 'Education', value: 'Education' },
            ]}
          />

          <Select
            label="Billing Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as any)}
            options={[
              { label: 'Monthly', value: 'monthly' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Yearly', value: 'yearly' },
            ]}
          />

          <Input
            label="Next Payment Date"
            type="date"
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Commitment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
