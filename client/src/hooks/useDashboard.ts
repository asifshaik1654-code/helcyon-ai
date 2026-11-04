/**
 * useDashboard.ts
 *
 * Custom React hook for fetching and refreshing dashboard summary and analytics data.
 */

import { useState, useEffect, useCallback } from 'react';
import type { DashboardSummary } from '../types';
import { getDashboardSummary } from '../services/dashboardService';

export function useDashboard(initialMonth?: string) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialMonth || new Date().toISOString().substring(0, 7)
  );

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const summary = await getDashboardSummary(selectedMonth);
      setData(summary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch dashboard metrics';
      setError(msg);
      console.error('[useDashboard error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    data,
    isLoading,
    error,
    selectedMonth,
    setSelectedMonth,
    refresh: fetchSummary,
  };
}
