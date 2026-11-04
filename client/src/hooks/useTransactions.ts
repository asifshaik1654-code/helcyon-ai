/**
 * useTransactions.ts
 *
 * Custom React hook that is the single source of truth for transaction data
 * on the client side.  Any page or component that needs transactions should
 * use this hook instead of calling the API directly.
 *
 * HOW IT WORKS (simple explanation)
 * -----------------------------------
 * 1. We store the list of transactions, pagination info, loading state, and
 *    any error message in React state.
 * 2. `fetchTransactions()` calls the backend, then updates that state.
 * 3. Add / edit / delete helpers call the right service function and then
 *    re-fetch so the UI always shows fresh data.
 * 4. We re-fetch automatically whenever `filters` changes (via useEffect).
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  Transaction,
  TransactionFilters,
  PaginatedResponse,
  TransactionSummary,
  ImportResult,
} from '../types/index';
import * as transactionService from '../services/transactionService';

// ── default filter values ──────────────────────────────────────────────────────

const DEFAULT_FILTERS: TransactionFilters = {
  page: 1,
  limit: 15,
  sortBy: 'transactionDate',
  sortOrder: 'desc',
};

// ── hook return type ───────────────────────────────────────────────────────────

export interface UseTransactionsReturn {
  /** Current page of transactions */
  transactions: Transaction[];
  /** Pagination metadata from the API */
  pagination: PaginatedResponse<Transaction>['pagination'] | null;
  /** Summary totals (income / expenses / balance) */
  summary: TransactionSummary | null;
  /** True while any network request is in-flight */
  isLoading: boolean;
  /** Error message, or null when everything is fine */
  error: string | null;
  /** Currently active filters – update these to change what's displayed */
  filters: TransactionFilters;
  /** Replace one or more filter values (page resets to 1 automatically) */
  setFilters: (patch: Partial<TransactionFilters>) => void;
  /** Reload transactions from the server with the current filters */
  refresh: () => Promise<void>;
  /** Create a new transaction and refresh the list */
  addTransaction: (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => Promise<Transaction>;
  /** Update an existing transaction and refresh the list */
  editTransaction: (
    id: string,
    data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<Transaction>;
  /** Delete a transaction and refresh the list */
  removeTransaction: (id: string) => Promise<void>;
  /** Import a batch of transactions parsed from CSV */
  importBatch: (
    rows: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ) => Promise<ImportResult>;
}

// ── hook implementation ────────────────────────────────────────────────────────

export function useTransactions(
  initialFilters: Partial<TransactionFilters> = {}
): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedResponse<Transaction>['pagination'] | null
  >(null);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TransactionFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Keep a ref so the latest filters are always readable inside callbacks
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listResult, summaryResult] = await Promise.all([
        transactionService.getTransactions(filtersRef.current),
        transactionService.getTransactionSummary({
          startDate: filtersRef.current.startDate,
          endDate: filtersRef.current.endDate,
        }),
      ]);
      setTransactions(listResult.items);
      setPagination(listResult.pagination);
      setSummary(summaryResult);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load transactions';
      setError(message);
      console.error('[useTransactions] fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []); // stable — reads filters from ref

  // Auto-fetch whenever filters change
  useEffect(() => {
    fetchTransactions();
  }, [filters, fetchTransactions]);

  // ── filter helper ──────────────────────────────────────────────────────────

  const setFilters = useCallback((patch: Partial<TransactionFilters>) => {
    setFiltersState((prev) => ({
      ...prev,
      ...patch,
      // Always reset to page 1 when filters (other than page) change
      page: patch.page !== undefined ? patch.page : 1,
    }));
  }, []);

  // ── mutation helpers ───────────────────────────────────────────────────────

  const addTransaction = useCallback(
    async (
      data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
    ): Promise<Transaction> => {
      const created = await transactionService.createTransaction(data);
      await fetchTransactions();
      return created;
    },
    [fetchTransactions]
  );

  const editTransaction = useCallback(
    async (
      id: string,
      data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<Transaction> => {
      const updated = await transactionService.updateTransaction(id, data);
      await fetchTransactions();
      return updated;
    },
    [fetchTransactions]
  );

  const removeTransaction = useCallback(
    async (id: string): Promise<void> => {
      await transactionService.deleteTransaction(id);
      await fetchTransactions();
    },
    [fetchTransactions]
  );

  const importBatch = useCallback(
    async (
      rows: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
    ): Promise<ImportResult> => {
      const result = await transactionService.importTransactions(rows);
      await fetchTransactions();
      return result;
    },
    [fetchTransactions]
  );

  // ── return ─────────────────────────────────────────────────────────────────

  return {
    transactions,
    pagination,
    summary,
    isLoading,
    error,
    filters,
    setFilters,
    refresh: fetchTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    importBatch,
  };
}

