/**
 * recurringService.ts
 *
 * REST client for recurring bills and automated subscription detection.
 */

import type { RecurringPayment, ExpenseCategory } from '../types';
import { apiFetch } from './apiClient';

export interface RecurringResponse {
  confirmed: RecurringPayment[];
  detected: RecurringPayment[];
  totalMonthlyOutflow: number;
}

export async function getRecurringPayments(): Promise<RecurringResponse> {
  return apiFetch<RecurringResponse>('/recurring');
}

export async function createRecurringPayment(data: {
  title: string;
  amount: number;
  category: ExpenseCategory;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextPaymentDate: string;
  status?: 'active' | 'paused' | 'cancelled';
}): Promise<RecurringPayment> {
  return apiFetch<RecurringPayment>('/recurring', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function confirmRecurringPayment(
  id: string,
  data?: Partial<RecurringPayment>
): Promise<RecurringPayment> {
  return apiFetch<RecurringPayment>(`/recurring/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function dismissRecurringPayment(id: string): Promise<void> {
  await apiFetch<void>(`/recurring/${id}/dismiss`, { method: 'POST' });
}

export async function updateRecurringPayment(
  id: string,
  data: Partial<RecurringPayment>
): Promise<RecurringPayment> {
  return apiFetch<RecurringPayment>(`/recurring/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteRecurringPayment(id: string): Promise<void> {
  await apiFetch<void>(`/recurring/${id}`, { method: 'DELETE' });
}

