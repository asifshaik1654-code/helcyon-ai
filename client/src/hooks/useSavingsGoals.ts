import { useState, useEffect, useCallback } from 'react';
import * as savingsService from '../services/savingsService';

export function useSavingsGoals() {
  const [data, setData] = useState<savingsService.SavingsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await savingsService.getSavingsGoals();
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch savings goals';
      setError(msg);
      console.error('[useSavingsGoals Error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (payload: {
    goalName: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    await savingsService.createSavingsGoal(payload);
    await fetchGoals();
  };

  const updateGoal = async (
    id: string,
    payload: Partial<{
      goalName: string;
      targetAmount: number;
      currentAmount: number;
      targetDate: string;
      priority: 'low' | 'medium' | 'high';
    }>
  ) => {
    await savingsService.updateSavingsGoal(id, payload);
    await fetchGoals();
  };

  const removeGoal = async (id: string) => {
    await savingsService.deleteSavingsGoal(id);
    await fetchGoals();
  };

  const contribute = async (id: string, amount: number, note?: string) => {
    await savingsService.addGoalContribution(id, amount, note);
    await fetchGoals();
  };

  return {
    goals: data?.goals || [],
    summary: data?.summary || null,
    isLoading,
    error,
    refresh: fetchGoals,
    addGoal,
    updateGoal,
    removeGoal,
    contribute,
  };
}
