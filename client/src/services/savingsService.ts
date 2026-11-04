/**
 * savingsService.ts
 *
 * REST client for Savings Goals and Milestone Contributions.
 */

import type { SavingsGoal, SavingsContribution } from '../types';

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

export interface SavingsGoalDetail extends SavingsGoal {
  progressPercentage: number;
  remainingAmount: number;
  suggestedMonthlyContribution: number;
  monthsRemaining: number;
  isCompleted: boolean;
  contributions: SavingsContribution[];
}

export interface SavingsSummaryResponse {
  goals: SavingsGoalDetail[];
  summary: {
    totalGoals: number;
    totalSaved: number;
    totalTarget: number;
    overallProgress: number;
  };
}

export async function getSavingsGoals(): Promise<SavingsSummaryResponse> {
  return apiFetch<SavingsSummaryResponse>('/savings-goals');
}

export async function createSavingsGoal(data: {
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  targetDate?: string;
  priority?: 'low' | 'medium' | 'high';
}): Promise<SavingsGoalDetail> {
  return apiFetch<SavingsGoalDetail>('/savings-goals', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSavingsGoal(
  id: string,
  data: Partial<{
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    priority: 'low' | 'medium' | 'high';
  }>
): Promise<SavingsGoalDetail> {
  return apiFetch<SavingsGoalDetail>(`/savings-goals/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await apiFetch<void>(`/savings-goals/${id}`, { method: 'DELETE' });
}

export async function addGoalContribution(
  id: string,
  amount: number,
  note?: string
): Promise<SavingsGoalDetail> {
  return apiFetch<SavingsGoalDetail>(`/savings-goals/${id}/contribute`, {
    method: 'POST',
    body: JSON.stringify({ amount, note }),
  });
}
