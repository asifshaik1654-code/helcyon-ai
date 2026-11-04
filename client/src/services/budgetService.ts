/**
 * budgetService.ts
 *
 * REST client for category budgets, actual spending aggregation, and threshold alerts.
 */

import type { BudgetProgress, ExpenseCategory } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const DEMO_TOKEN = 'demo-session-token';

function getAuthHeader(): string {
  const raw = localStorage.getItem('sb-auth-token');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.access_token ?? parsed?.currentSession?.access_token;
      if (token) return `Bearer ${token}`;
    } catch {
      // ignore
    }
  }
  const stored = localStorage.getItem('helcyon_token');
  if (stored) return `Bearer ${stored}`;
  return `Bearer ${DEMO_TOKEN}`;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...(options.headers ?? {}),
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = (json as { message?: string }).message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  return (json as { data: T }).data;
}

export interface BudgetListResponse {
  month: string;
  budgets: BudgetProgress[];
  summary: {
    totalBudget: number;
    totalSpent: number;
    totalRemaining: number;
    overallUtilization: number;
    safeCount: number;
    warningCount: number;
    dangerCount: number;
  };
}

export interface BudgetAlert {
  category: string;
  status: 'warning' | 'danger';
  budgetAmount: number;
  spent: number;
  utilizationPercentage: number;
  message: string;
}

export async function getBudgets(month?: string): Promise<BudgetListResponse> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<BudgetListResponse>(`/budgets${query}`);
}

export async function getBudgetAlerts(month?: string): Promise<{ alerts: BudgetAlert[] }> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<{ alerts: BudgetAlert[] }>(`/budgets/alerts${query}`);
}

export async function createBudget(data: {
  category: ExpenseCategory;
  budgetAmount: number;
  budgetMonth: string;
}): Promise<BudgetProgress> {
  return apiFetch<BudgetProgress>('/budgets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBudget(id: string, budgetAmount: number): Promise<BudgetProgress> {
  return apiFetch<BudgetProgress>(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ budgetAmount }),
  });
}

export async function deleteBudget(id: string): Promise<void> {
  await apiFetch<void>(`/budgets/${id}`, { method: 'DELETE' });
}
