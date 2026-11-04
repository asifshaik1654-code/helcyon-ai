/**
 * TransactionsPage.tsx
 *
 * The main transaction ledger page.  It is now fully connected to the live
 * backend API via the `useTransactions` hook — no mock data is used here.
 */

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Upload,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit2,
  Receipt,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { Transaction } from '../types';
import { TransactionFormModal } from '../components/transactions/TransactionFormModal';
import { CSVImportModal } from '../components/transactions/CSVImportModal';
import { useTransactions } from '../hooks/useTransactions';

// ── props ──────────────────────────────────────────────────────────────────────

interface TransactionsPageProps {
  isDemoMode?: boolean;
  currency?: string;
}

// ── component ──────────────────────────────────────────────────────────────────

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  currency = 'INR',
}) => {
  // ── modal state ──────────────────────────────────────────────────────────
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  // ── live data from the API ───────────────────────────────────────────────
  const {
    transactions,
    pagination,
    summary,
    isLoading,
    error,
    filters,
    setFilters,
    refresh,
    addTransaction,
    editTransaction,
    removeTransaction,
    importBatch,
  } = useTransactions({ limit: 15, sortBy: 'transactionDate', sortOrder: 'desc' });

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleSaveTransaction = async (data: Partial<Transaction>) => {
    setActionError(null);
    try {
      if (editingTransaction) {
        await editTransaction(editingTransaction.id, data as Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>);
      } else {
        await addTransaction(data as Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>);
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to save transaction');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    setActionError(null);
    try {
      await removeTransaction(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete transaction');
      setDeleteConfirmId(null);
    }
  };

  const handleImportSuccess = async (
    rows: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => {
    setActionError(null);
    setImportSuccess(null);
    try {
      const result = await importBatch(rows);
      setImportSuccess(
        `Import complete — ${result.imported} added, ${result.skipped} skipped as duplicates.`
      );
      setIsCSVModalOpen(false);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Import failed');
    }
  };

  // ── summary totals ────────────────────────────────────────────────────────

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const balance = summary?.availableBalance ?? 0;

  // ── pagination helpers ────────────────────────────────────────────────────

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.total ?? 0;
  const limit = pagination?.limit ?? 15;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage, filter, search, and import all inflow and outflow records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refresh()}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            title="Refresh"
          >
            Refresh
          </Button>
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
            onClick={() => { setEditingTransaction(null); setIsAddModalOpen(true); }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── Action notifications ───────────────────────────────────────── */}
      {actionError && (
        <div className="flex items-center gap-3 bg-rose-900/30 border border-rose-700/50 text-rose-300 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-auto text-rose-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}
      {importSuccess && (
        <div className="flex items-center gap-3 bg-emerald-900/30 border border-emerald-700/50 text-emerald-300 text-sm rounded-lg px-4 py-3">
          <Receipt className="w-4 h-4 shrink-0" />
          <span>{importSuccess}</span>
          <button onClick={() => setImportSuccess(null)} className="ml-auto text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      {/* ── API fetch error banner ─────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-amber-900/30 border border-amber-700/50 text-amber-300 text-sm rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Could not connect to the server: {error}</span>
          <Button size="sm" variant="ghost" onClick={() => refresh()} className="ml-auto text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* ── Summary Stat Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: totalIncome, color: 'text-emerald-400', sign: '+' },
          { label: 'Total Expenses', value: totalExpenses, color: 'text-rose-400', sign: '-' },
          { label: 'Net Balance', value: balance, color: balance >= 0 ? 'text-sky-400' : 'text-orange-400', sign: '' },
        ].map(({ label, value, color, sign }) => (
          <Card key={label} className="p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={`text-lg font-bold mt-1 font-mono ${color}`}>
              {isLoading ? <Skeleton className="h-6 w-28" /> : `${sign}${formatCurrency(value, currency)}`}
            </p>
          </Card>
        ))}
      </div>

      {/* ── Filter + Search Bar ────────────────────────────────────────── */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by title, category, or memo…"
            leftIcon={<Search className="w-4 h-4" />}
            value={filters.search ?? ''}
            onChange={(e) => setFilters({ search: e.target.value })}
          />

          <Select
            value={filters.type ?? 'all'}
            onChange={(e) => setFilters({ type: e.target.value === 'all' ? undefined : e.target.value as 'income' | 'expense' })}
            options={[
              { label: 'All Transaction Types', value: 'all' },
              { label: 'Expenses Only (−)', value: 'expense' },
              { label: 'Income Only (+)', value: 'income' },
            ]}
          />

          <Select
            value={filters.category ?? 'all'}
            onChange={(e) => setFilters({ category: e.target.value === 'all' ? undefined : e.target.value as Transaction['category'] })}
            options={[
              { label: 'All Categories', value: 'all' },
              { label: 'Housing', value: 'Housing' },
              { label: 'Food & Dining', value: 'Food & Dining' },
              { label: 'Groceries', value: 'Groceries' },
              { label: 'Transport', value: 'Transport' },
              { label: 'Utilities', value: 'Utilities' },
              { label: 'Shopping', value: 'Shopping' },
              { label: 'Entertainment', value: 'Entertainment' },
              { label: 'Healthcare', value: 'Healthcare' },
              { label: 'Education', value: 'Education' },
              { label: 'Technology', value: 'Technology' },
              { label: 'Personal Care', value: 'Personal Care' },
              { label: 'Travel', value: 'Travel' },
              { label: 'Investments', value: 'Investments' },
              { label: 'Salary', value: 'Salary' },
              { label: 'Freelance', value: 'Freelance' },
              { label: 'Business', value: 'Business' },
              { label: 'Gift', value: 'Gift' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </div>
      </Card>

      {/* ── Transactions Table ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Records ({isLoading ? '…' : totalCount})</span>
          </CardTitle>
          <span className="text-xs text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="divide-y divide-slate-800/60">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 flex-1" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3.5 w-20 ml-auto" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={Receipt}
                title={error ? 'Could Not Load Transactions' : 'No Transactions Found'}
                description={
                  error
                    ? 'The server could not be reached. Add a transaction below or retry after starting the backend server.'
                    : 'No records match your current filters. Try clearing search or category filters, or add your first transaction.'
                }
                actionLabel={error ? 'Retry' : 'Add Transaction'}
                onAction={error ? () => refresh() : () => { setEditingTransaction(null); setIsAddModalOpen(true); }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0A0E17]/60 text-[11px] text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-6">Date</th>
                    <th className="p-3.5">Title &amp; Memo</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5 text-right">Amount</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => {
                    const isIncome = tx.transactionType === 'income';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/25 transition-colors">
                        <td className="p-3.5 pl-6 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                          {formatDate(tx.transactionDate, 'medium')}
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            {isIncome
                              ? <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              : <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                            <span>{tx.title}</span>
                            {tx.isRecurring && (
                              <Badge variant="cyan" size="sm" className="text-[9px]">Recurring</Badge>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                              {tx.description}
                            </p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <Badge variant="slate" size="sm">{tx.category}</Badge>
                        </td>
                        <td className="p-3.5 text-slate-300 whitespace-nowrap">{tx.paymentMethod}</td>
                        <td
                          className={`p-3.5 text-right font-mono font-bold whitespace-nowrap tabular-nums ${isIncome ? 'text-emerald-400' : 'text-slate-100'
                            }`}
                        >
                          {isIncome ? '+' : '−'}{formatCurrency(tx.amount, currency)}
                        </td>
                        <td className="p-3.5 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setEditingTransaction(tx); setIsAddModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(tx.id)}
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

        {/* ── Pagination controls ── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-800 px-6 py-3">
            <span className="text-xs text-slate-400">
              Showing {((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters({ page: currentPage - 1 })}
                disabled={!pagination?.hasPrevPage}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-300 font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setFilters({ page: currentPage + 1 })}
                disabled={!pagination?.hasNextPage}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F1623] border border-slate-700 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-900/30 rounded-lg">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete Transaction</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-300 mb-6">
              Are you sure you want to permanently delete this transaction record?
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
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modals ────────────────────────────────────────────────────── */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
      />

      <CSVImportModal
        isOpen={isCSVModalOpen}
        onClose={() => setIsCSVModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};