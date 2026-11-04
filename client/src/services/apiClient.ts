/**
 * apiClient.ts
 *
 * Centralized, production-resilient HTTP client for Helcyon AI.
 * Handles:
 *  1. Dynamic API Base URL resolution (local, deployed custom domain, or reverse-proxy).
 *  2. Robust Token Resolution (Supabase SDK session, localStorage helcyon_token, project-scoped sb-*-auth-token, or demo fallback).
 *  3. Meaningful error handling and response unwrapping.
 */

import { supabase, isSupabaseFrontendConfigured } from './supabase';

/**
 * Resolves the backend base URL accurately in both local and deployed environments.
 */
export function getApiBaseUrl(): string {
  // 1. Explicitly configured VITE_API_URL (e.g. from Vercel / Netlify environment variables)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // 2. In deployed browser environments where backend and frontend share a domain or reverse proxy
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.origin}/api`;
  }

  // 3. Localhost development fallback
  return 'http://localhost:5000/api';
}

/**
 * Resolves the authentication Bearer token accurately.
 */
export async function getAuthHeader(): Promise<string> {
  // 1. If Supabase is configured, retrieve token from active Supabase session
  if (isSupabaseFrontendConfigured) {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      if (token) {
        localStorage.setItem('helcyon_token', token);
        return `Bearer ${token}`;
      }
    } catch {
      // ignore
    }
  }

  // 2. Check explicitly stored helcyon_token
  const stored = localStorage.getItem('helcyon_token');
  if (stored) {
    return `Bearer ${stored}`;
  }

  // 3. Scan localStorage for any Supabase session keys (format: sb-<projectRef>-auth-token)
  if (typeof localStorage !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        try {
          const val = JSON.parse(localStorage.getItem(key) || '{}');
          const token = val?.access_token ?? val?.currentSession?.access_token;
          if (token) {
            return `Bearer ${token}`;
          }
        } catch {
          // ignore parsing error
        }
      }
    }
  }

  // 4. Default Demo Token for offline presentation mode
  return 'Bearer demo-session-token';
}

/**
 * Executes an authenticated API request with proper headers and error unwrapping.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;
  const authHeader = await getAuthHeader();

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
      ...(options.headers ?? {}),
    },
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (json as { message?: string }).message ??
      `Network Request Error (HTTP ${response.status})`;
    throw new Error(message);
  }

  return (json as { data: T }).data;
}
