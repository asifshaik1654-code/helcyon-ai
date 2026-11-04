/**
 * notificationService.ts
 *
 * Client service for interacting with /api/notifications
 */

import { apiFetch } from './apiClient';
import { InAppNotification } from '../types';

export interface NotificationItem {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'goal_milestone' | 'goal_inactive';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
  metadata?: { category?: string; amount?: number; goalName?: string };
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

export async function fetchNotifications(): Promise<NotificationsResponse> {
  return apiFetch<NotificationsResponse>('/notifications');
}

export async function markNotificationAsRead(id: string): Promise<{ id: string; isRead: boolean }> {
  return apiFetch<{ id: string; isRead: boolean }>(`/notifications/${id}/read`, {
    method: 'POST',
  });
}

export async function markAllNotificationsAsRead(): Promise<{ markedRead: number }> {
  return apiFetch<{ markedRead: number }>('/notifications/read-all', {
    method: 'POST',
  });
}

