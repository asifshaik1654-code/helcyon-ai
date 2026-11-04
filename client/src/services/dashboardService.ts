/**
 * dashboardService.ts
 *
 * Talks to GET /api/dashboard/summary to fetch aggregated financial metrics,
 * monthly spending trends, category breakdown, and recent transactions.
 */

import type { DashboardSummary } from '../types/index';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const DEMO_TOKEN = 'demo-session-token';

function getAuthHeader(): string {
  const raw = localStorage.getItem('sb-auth-token');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token: string | undefined =
        parsed?.access_token ?? parsed?.currentSession?.access_token;
      if (token) return `Bearer ${token}`;
    } catch {
      // ignore
    }
  }

  const stored = localStorage.getItem('helcyon_token');
  if (stored) return `Bearer ${stored}`;

  return `Bearer ${DEMO_TOKEN}`;
}

export async function getDashboardSummary(month?: string): Promise<DashboardSummary> {
  const query = month ? `?month=${encodeURIComponent(month)}` : '';
  const url = `${API_BASE}/dashboard/summary${query}`;

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message: string =
      (json as { message?: string }).message ??
      `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(message);
  }

  return (json as { data: DashboardSummary }).data;
}
