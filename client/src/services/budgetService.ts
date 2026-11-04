/**
 * budgetService.ts
 *
 * REST client for category budgets, actual spending aggregation, and threshold alerts.
 */

import type { BudgetProgress, ExpenseCategory } from '../types';
import { apiFetch } from './apiClient';

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
