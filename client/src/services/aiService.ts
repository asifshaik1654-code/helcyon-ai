/**
 * aiService.ts
 *
 * REST client for Google Gemini AI features:
 *  - Automatic Category Suggestions
 *  - Conversational Financial Assistant
 *  - Grounded Financial Observations
 */

import { apiFetch } from './apiClient';

export interface AICategoryResponse {
  category: string;
  confidence: number;
  reasoning: string;
  source: 'gemini' | 'rule_fallback';
}

export interface AIChatResponse {
  reply: string;
  factsUsed: string[];
  source: 'gemini' | 'context_engine';
}

export async function categorizeTransaction(
  title: string,
  amount?: number,
  description?: string
): Promise<AICategoryResponse> {
  return apiFetch<AICategoryResponse>('/ai/categorize', {
    method: 'POST',
    body: JSON.stringify({ title, amount, description }),
  });
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: string }> = []
): Promise<AIChatResponse> {
  return apiFetch<AIChatResponse>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

export async function getFinancialInsights(): Promise<any> {
  return apiFetch<any>('/ai/insights');
}

