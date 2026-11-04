/**
 * anomalyService.ts
 *
 * REST client for spending anomalies and pattern outliers.
 */

import { apiFetch } from './apiClient';

export interface AnomalyItem {
  id: string;
  type: 'spike' | 'surge' | 'duplicate_check';
  title: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  amount?: number;
  date: string;
  explanation: string;
  isDismissed: boolean;
  metadata?: Record<string, any>;
}

export interface AnomalyResponse {
  anomalies: AnomalyItem[];
  totalFlagged: number;
  categoriesAnalyzed: number;
}

export async function getAnomalies(): Promise<AnomalyResponse> {
  return apiFetch<AnomalyResponse>('/insights/anomalies');
}

export async function dismissAnomaly(id: string): Promise<void> {
  await apiFetch<void>(`/insights/anomalies/${id}/dismiss`, { method: 'POST' });
}

