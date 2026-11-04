/**
 * dashboardService.ts
 *
 * Talks to GET /api/dashboard/summary to fetch aggregated financial metrics,
 * monthly spending trends, category breakdown, and recent transactions.
 */

import type { DashboardSummary } from '../types/index';
import { apiFetch } from './apiClient';

export async function getDashboardSummary(month?: string): Promise<DashboardSummary> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  return apiFetch<DashboardSummary>(`/dashboard/summary${query}`);
}
