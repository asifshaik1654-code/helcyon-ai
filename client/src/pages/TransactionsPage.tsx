import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Receipt,
  Download
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';
import { mockTransactions } from '../data/mockData';
import { Transaction, TransactionType } from '../types';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { CSVImportModal } from '../components/transactions/CSVImportModal';

interface TransactionsPageProps {
  isDemoMode: boolean;
  currency?: string;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  isDemoMode,
  currency = 'INR',
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(isDemoMode ? mockTransactions : []);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Filtered & Searched Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType =
        selectedType === 'all' || tx.transactionType === selectedType;

      const matchesCategory =
        selectedCategory === 'all' || tx.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, searchQuery, selectedType, selectedCategory]);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleSaveTransaction = (data: Partial<Transaction>) => {
    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingTransaction.id ? ({ ...t, ...data } as Transaction) : t))
      );
      setEditingTransaction(null);
    } else {
      const newTx: Transaction = {
        id: 'tx_' + Date.now(),
        userId: 'usr_demo_7890',
        title: data.title || 'Untitled',
        amount: data.amount || 0,
        transactionType: data.transactionType || 'expense',
        category: data.category || 'Other',
        transactionDate: data.transactionDate || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'UPI',
        description: data.description,
        isRecurring: data.isRecurring,
      };
      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, filter, search, and import all inflow and outflow records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCSVModalOpen(true)}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
          >
            Import CSV
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search transactions by title or memo..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={[
              { label: 'All Transaction Types', value: 'all' },
              { label: 'Expenses Only (-)', value: 'expense' },
              { label: 'Income Only (+)', value: 'income' },
            ]}
          />

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Housing', value: 'Housing' },
              { label: 'Food & Dining', value: 'Food & Dining' },
              { label: 'Groceries', value: 'Groceries' },
              { label: 'Transport', value: 'Transport' },
              { label: 'Utilities', value: 'Utilities' },
              { label: 'Salary', value: 'Salary' },
              { label: 'Freelance', value: 'Freelance' },
            ]}
          />
        </div>
      </Card>

      {/* Transactions Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Records ({filteredTransactions.length})</span>
          </CardTitle>
          <span className="text-xs text-slate-400">
            Showing filtered results
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {filteredTransactions.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon={Receipt}
                title="No Transactions Match Your Filter"
                description="Try clearing your search query or reset the category filters to view recorded data."
                actionLabel="Reset Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedCategory('all');
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0E17]/60 text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Date</th>
                    <th className="p-3.5">Title & Memo</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Payment Method</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.map((tx) => {
                    const isIncome = tx.transactionType === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/25 transition-colors">
                        <td className="p-3.5 pl-6 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(tx.transactionDate, 'medium')}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            {isIncome ? (
                              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span>{tx.title}</span>
                            {tx.isRecurring && (
                              <Badge variant="cyan" size="sm" className="text-[9px]">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                              {tx.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <Badge variant="slate" size="sm">
                            {tx.category}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-slate-300">{tx.paymentMethod}</td>
                        <td
                          className={`p-3.5 text-right font-mono font-bold whitespace-nowrap tabular-nums ${
                            isIncome ? 'text-emerald-400' : 'text-slate-100'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingTransaction(tx);
                                setIsAddModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImportSuccess={(count) => {
          alert(`Successfully imported ${count} transactions!`);
        }}
      />
    </div>
  );
};

