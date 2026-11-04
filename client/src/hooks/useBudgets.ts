import { useState, useEffect, useCallback } from 'react';
import type { ExpenseCategory } from '../types';
import * as budgetService from '../services/budgetService';

export function useBudgets(initialMonth?: string) {
  const [data, setData] = useState<budgetService.BudgetListResponse | null>(null);
  const [alerts, setAlerts] = useState<budgetService.BudgetAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || new Date().toISOString().substring(0, 7)
  );

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [listRes, alertsRes] = await Promise.all([
        budgetService.getBudgets(selectedMonth),
        budgetService.getBudgetAlerts(selectedMonth),
      ]);
      setData(listRes);
      setAlerts(alertsRes.alerts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch budget metrics';
      setError(msg);
      console.error('[useBudgets Error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const saveBudget = async (category: ExpenseCategory, amount: number) => {
    await budgetService.createBudget({
      category,
      budgetAmount: amount,
      budgetMonth: selectedMonth,
    });
    await fetchBudgets();
  };

  const removeBudget = async (id: string) => {
    await budgetService.deleteBudget(id);
    await fetchBudgets();
  };

  return {
    data,
    alerts,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    refresh: fetchBudgets,
    saveBudget,
    removeBudget,
  };
}

