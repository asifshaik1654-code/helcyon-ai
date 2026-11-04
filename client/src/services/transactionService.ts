/**
 * transactionService.ts
 *
 * All HTTP calls that talk to the backend /api/transactions endpoints live here.
 * The rest of the frontend never calls fetch() directly for transactions — it
 * always goes through these helper functions so there is exactly one place to
 * update if the API changes.
 *
 * HOW AUTH WORKS
 * --------------
 * When Supabase is configured the user's JWT is stored by Supabase Auth.
 * When running in demo mode (no Supabase) we fall back to the well-known
 * demo token that the backend also recognises.
 *
 * HOW BASE URL WORKS
 * ------------------
 * In development the Vite dev-server proxies /api to localhost:5000, so we
 * use an empty base.  In production VITE_API_URL can point at the deployed
 * server.
 */

import type {
  Transaction,
  TransactionFilters,
  PaginatedResponse,
  TransactionSummary,
  ImportResult,
} from '../types/index';
import { apiFetch } from './apiClient';

/** Serialises filter params into a URLSearchParams string. */
function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  }
  const str = sp.toString();
  return str ? `?${str}` : '';
}

// ── public API ─────────────────────────────────────────────────────────────────

/**
 * Fetch a paginated, filtered list of transactions.
 *
 * @param filters  Search and filter options (page, limit, type, category, …)
 */
export async function getTransactions(
  filters: Partial<TransactionFilters> = {}
): Promise<PaginatedResponse<Transaction>> {
  const query = buildQuery(filters as Record<string, unknown>);
  return apiFetch<PaginatedResponse<Transaction>>(`/transactions${query}`);
}

/**
 * Fetch a single transaction by its UUID.
 */
export async function getTransactionById(id: string): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`);
}

/**
 * Create a new transaction.
 */
export async function createTransaction(
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  return apiFetch<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
  id: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<Transaction> {
  return apiFetch<Transaction>(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a transaction by its UUID.
 */
export async function deleteTransaction(id: string): Promise<void> {
  await apiFetch<void>(`/transactions/${id}`, { method: 'DELETE' });
}

/**
 * Batch-import transactions parsed from a CSV file.
 *
 * The backend deduplicates rows that share the same title + amount + date as
 * an existing transaction and returns a summary of what was inserted vs skipped.
 */
export async function importTransactions(
  rows: Array<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<ImportResult> {
  return apiFetch<ImportResult>('/transactions/import', {
    method: 'POST',
    body: JSON.stringify({ transactions: rows }),
  });
}

/**
 * Fetch aggregated totals (income, expenses, balance) for the current user.
 *
 * @param filters  Optional date range to narrow the summary period.
 */
export async function getTransactionSummary(
  filters: { startDate?: string; endDate?: string } = {}
): Promise<TransactionSummary> {
  const query = buildQuery(filters as Record<string, unknown>);
  return apiFetch<TransactionSummary>(`/transactions/summary${query}`);
}

