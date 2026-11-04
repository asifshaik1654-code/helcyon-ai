import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Transaction, TransactionType, PaymentMethod, ExpenseCategory, IncomeCategory } from '../../types';
import { Sparkles } from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionData: Partial<Transaction>) => void;
  initialData?: Transaction | null;
}

const expenseCategories: ExpenseCategory[] = [
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
  'Other'
];

const incomeCategories: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Business',
  'Investments',
  'Rental Income',
  'Gift',
  'Refund',
  'Other'
];

const paymentMethods: PaymentMethod[] = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Cash',
  'Bank Transfer',
  'Other'
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [amount, setAmount] = useState<string>(initialData ? String(initialData.amount) : '');
  const [type, setType] = useState<TransactionType>(initialData?.transactionType || 'expense');
  const [category, setCategory] = useState<string>(
    initialData?.category || (type === 'expense' ? 'Food & Dining' : 'Salary')
  );
  const [date, setDate] = useState(
    initialData?.transactionDate || new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData?.paymentMethod || 'UPI'
  );
  const [description, setDescription] = useState(initialData?.description || '');
  const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === 'expense' ? 'Food & Dining' : 'Salary');
  };

  // Rule-based instant category suggestion preview
  const getSuggestedCategory = (titleStr: string): string | null => {
    const lower = titleStr.toLowerCase();
    if (lower.includes('rent') || lower.includes('flat') || lower.includes('pg')) return 'Housing';
    if (lower.includes('food') || lower.includes('swiggy') || lower.includes('zomato') || lower.includes('bistro') || lower.includes('cafe')) return 'Food & Dining';
    if (lower.includes('grocery') || lower.includes('blinkit') || lower.includes('zepto') || lower.includes('supermarket')) return 'Groceries';
    if (lower.includes('uber') || lower.includes('ola') || lower.includes('metro') || lower.includes('bus') || lower.includes('fuel')) return 'Transport';
    if (lower.includes('electricity') || lower.includes('wifi') || lower.includes('broadband') || lower.includes('airtel') || lower.includes('jio')) return 'Utilities';
    if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('prime') || lower.includes('movie')) return 'Entertainment';
    if (lower.includes('amazon') || lower.includes('myntra') || lower.includes('cloth') || lower.includes('shoe')) return 'Shopping';
    if (lower.includes('salary') || lower.includes('payroll')) return 'Salary';
    return null;
  };

  const suggestedCat = getSuggestedCategory(title);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Transaction title is required';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) newErrors.amount = 'Please enter a valid positive amount';
    if (!date) newErrors.date = 'Date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      title: title.trim(),
      amount: numAmount,
      transactionType: type,
      category: category as any,
      transactionDate: date,
      paymentMethod,
      description: description.trim(),
      isRecurring,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
      description="Enter transaction details for exact mathematical accounting."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Expense vs Income */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0A0E17] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'expense'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`py-2 rounded-lg text-xs font-semibold transition-all ${
              type === 'income'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Income (+)
          </button>
        </div>

        {/* Title */}
        <div>
          <Input
            label="Transaction Title / Merchant"
            placeholder="e.g. Supermarket Groceries or Monthly Salary"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            error={errors.title}
            required
          />
          {suggestedCat && suggestedCat !== category && (
            <button
              type="button"
              onClick={() => setCategory(suggestedCat)}
              className="mt-1 flex items-center gap-1.5 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              <span>Suggested category: <strong>{suggestedCat}</strong> (Click to apply)</span>
            </button>
          )}
        </div>

        {/* Amount & Date in 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            error={errors.amount}
            required
          />

          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={errors.date}
            required
          />
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={(type === 'expense' ? expenseCategories : incomeCategories).map((c) => ({
              label: c,
              value: c,
            }))}
          />

          <Select
            label="Payment Method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={paymentMethods.map((m) => ({
              label: m,
              value: m,
            }))}
          />
        </div>

        {/* Description / Notes */}
        <Input
          label="Notes / Description (Optional)"
          placeholder="Additional context or invoice memo"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Recurring Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isRecurring"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-400 focus:ring-offset-0 cursor-pointer"
          />
          <label htmlFor="isRecurring" className="text-xs text-slate-300 cursor-pointer select-none">
            This is a recurring monthly payment (e.g. rent, broadband, subscription)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? 'Update Transaction' : 'Save Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

