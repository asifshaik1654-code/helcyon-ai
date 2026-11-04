/**
 * savingsService.ts
 *
 * REST client for Savings Goals and Milestone Contributions.
 */

import type { SavingsGoal, SavingsContribution } from '../types';
import { apiFetch } from './apiClient';

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
