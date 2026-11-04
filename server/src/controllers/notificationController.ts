import { Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response.js';
import { getTransactionsByUser } from './transactionController.js';
import { mockBudgetsStore } from './dashboardController.js';
import { isSupabaseLive } from '../config/supabase.js';
import { getSupabaseClient } from '../config/supabase.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  type: 'budget_warning' | 'budget_exceeded' | 'bill_due' | 'goal_milestone' | 'goal_inactive';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  createdAt: string;
  metadata?: { category?: string; amount?: number; goalName?: string };
}

// In-memory read state: maps userId → Set of read notification ids
const readNotifications = new Map<string, Set<string>>();

// ---------------------------------------------------------------------------
// Mock recurring payments for demo user (from recurringController shapes)
// ---------------------------------------------------------------------------
const mockRecurringForNotif = [
  { id: 'rec_01', name: 'Apartment Rent', amount: 22000, dayOfMonth: 1 },
  { id: 'rec_02', name: 'Jio Fiber Broadband', amount: 999, dayOfMonth: 5 },
  { id: 'rec_03', name: 'Netflix Premium', amount: 649, dayOfMonth: 10 },
  { id: 'rec_04', name: 'Spotify Premium', amount: 119, dayOfMonth: 7 },
];

const mockGoalsForNotif = [
  { id: 'goal_01', goal_name: 'Emergency Safety Reserve', target_amount: 150000, current_amount: 95000, target_date: '2027-04-30', last_contribution: '2026-11-01' },
  { id: 'goal_02', goal_name: 'MacBook Pro Development Rig', target_amount: 180000, current_amount: 162000, target_date: '2027-02-15', last_contribution: '2026-11-02' },
  { id: 'goal_03', goal_name: 'Annual Tech Conference Trip', target_amount: 45000, current_amount: 18000, target_date: '2027-07-20', last_contribution: '2026-09-15' },
];

// ---------------------------------------------------------------------------
// Core: build notification list for a user
// ---------------------------------------------------------------------------

function buildNotificationsForDemo(userId: string): Notification[] {
  const readSet = readNotifications.get(userId) ?? new Set<string>();
  const now = new Date();
  const today = now.getDate();
  const currentMonth = now.toISOString().substring(0, 7);
  const nots: Notification[] = [];

  // ---- 1. Budget alerts ----
  const userBudgets = mockBudgetsStore.filter(
    (b) => b.user_id === userId && b.budget_month === currentMonth
  );
  const transactions = getTransactionsByUser(userId).filter((t) => {
    const d = t.transaction_date;
    const type = t.transaction_type;
    return d?.startsWith(currentMonth) && type === 'expense';
  });
  const spentMap: Record<string, number> = {};
  for (const t of transactions) {
    const cat = t.category ?? 'Other';
    spentMap[cat] = (spentMap[cat] ?? 0) + Number(t.amount);
  }

  for (const b of userBudgets) {
    const spent = spentMap[b.category] ?? 0;
    const pct = b.budget_amount > 0 ? (spent / b.budget_amount) * 100 : 0;

    if (pct > 100) {
      const id = `notif_budget_exceeded_${b.id}`;
      nots.push({
        id,
        type: 'budget_exceeded',
        title: `Budget Exceeded: ${b.category}`,
        message: `You have spent ₹${spent.toLocaleString('en-IN')} of your ₹${b.budget_amount.toLocaleString('en-IN')} ${b.category} budget (${pct.toFixed(0)}%). Consider rebalancing for the rest of the month.`,
        severity: 'critical',
        isRead: readSet.has(id),
        createdAt: new Date().toISOString(),
        metadata: { category: b.category, amount: spent },
      });
    } else if (pct >= 80) {
      const id = `notif_budget_warn_${b.id}`;
      nots.push({
        id,
        type: 'budget_warning',
        title: `Budget Alert: ${b.category}`,
        message: `You have used ${pct.toFixed(0)}% of your ${b.category} budget (₹${spent.toLocaleString('en-IN')} of ₹${b.budget_amount.toLocaleString('en-IN')}). Approaching monthly limit.`,
        severity: 'warning',
        isRead: readSet.has(id),
        createdAt: new Date().toISOString(),
        metadata: { category: b.category, amount: spent },
      });
    }
  }

  // ---- 2. Recurring bills due within 7 days ----
  for (const rec of mockRecurringForNotif) {
    const daysUntilDue = rec.dayOfMonth >= today ? rec.dayOfMonth - today : (30 - today) + rec.dayOfMonth;
    if (daysUntilDue <= 7) {
      const id = `notif_bill_${rec.id}`;
      nots.push({
        id,
        type: 'bill_due',
        title: `Bill Due Soon: ${rec.name}`,
        message: `${rec.name} of ₹${rec.amount.toLocaleString('en-IN')} is due in ${daysUntilDue === 0 ? 'today' : `${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`}. Ensure your account balance is sufficient.`,
        severity: daysUntilDue <= 2 ? 'critical' : 'warning',
        isRead: readSet.has(id),
        createdAt: new Date().toISOString(),
        metadata: { amount: rec.amount },
      });
    }
  }

  // ---- 3. Savings goal milestones (>90% funded) ----
  for (const goal of mockGoalsForNotif) {
    const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    if (pct >= 90 && pct < 100) {
      const id = `notif_goal_milestone_${goal.id}`;
      nots.push({
        id,
        type: 'goal_milestone',
        title: `Almost There! ${goal.goal_name}`,
        message: `Your "${goal.goal_name}" goal is ${pct.toFixed(0)}% funded (₹${goal.current_amount.toLocaleString('en-IN')} / ₹${goal.target_amount.toLocaleString('en-IN')}). Just ₹${(goal.target_amount - goal.current_amount).toLocaleString('en-IN')} more to go!`,
        severity: 'info',
        isRead: readSet.has(id),
        createdAt: new Date().toISOString(),
        metadata: { goalName: goal.goal_name, amount: goal.current_amount },
      });
    }
  }

  // ---- 4. Goals with no contribution in 30 days ----
  for (const goal of mockGoalsForNotif) {
    if (!goal.last_contribution) continue;
    const lastContrib = new Date(goal.last_contribution);
    const daysSince = Math.floor((now.getTime() - lastContrib.getTime()) / (1000 * 60 * 60 * 24));
    const pct = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
    if (daysSince >= 30 && pct < 100) {
      const id = `notif_goal_inactive_${goal.id}`;
      nots.push({
        id,
        type: 'goal_inactive',
        title: `Goal Reminder: ${goal.goal_name}`,
        message: `No contributions to "${goal.goal_name}" in the last ${daysSince} days. Consider setting aside a monthly deposit to stay on track.`,
        severity: 'info',
        isRead: readSet.has(id),
        createdAt: new Date().toISOString(),
        metadata: { goalName: goal.goal_name },
      });
    }
  }

  // Sort: unread first, then by severity
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  nots.sort((a, b) => {
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
  });

  return nots;
}

// ---------------------------------------------------------------------------
// Controller: GET /api/notifications
// ---------------------------------------------------------------------------

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      // For real users: build from live Supabase data
      const sb = getSupabaseClient(req.token);
      const readSet = readNotifications.get(userId) ?? new Set<string>();
      const nots: Notification[] = [];
      const now = new Date();
      const today = now.getDate();
      const currentMonth = now.toISOString().substring(0, 7);

      // Budget alerts
      const { data: budgets } = await sb
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('budget_month', currentMonth);

      const { data: txs } = await sb
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('transaction_type', 'expense')
        .like('transaction_date', `${currentMonth}%`);

      const spentMap: Record<string, number> = {};
      for (const t of txs ?? []) {
        const cat = t.category ?? 'Other';
        spentMap[cat] = (spentMap[cat] ?? 0) + Number(t.amount);
      }

      for (const b of budgets ?? []) {
        const spent = spentMap[b.category] ?? 0;
        const pct = b.budget_amount > 0 ? (spent / b.budget_amount) * 100 : 0;
        if (pct > 100) {
          const id = `notif_budget_exceeded_${b.id}`;
          nots.push({
            id,
            type: 'budget_exceeded',
            title: `Budget Exceeded: ${b.category}`,
            message: `You've spent ₹${spent.toLocaleString('en-IN')} of your ₹${Number(b.budget_amount).toLocaleString('en-IN')} ${b.category} budget (${pct.toFixed(0)}%).`,
            severity: 'critical',
            isRead: readSet.has(id),
            createdAt: now.toISOString(),
            metadata: { category: b.category, amount: spent },
          });
        } else if (pct >= 80) {
          const id = `notif_budget_warn_${b.id}`;
          nots.push({
            id,
            type: 'budget_warning',
            title: `Budget Alert: ${b.category}`,
            message: `You've used ${pct.toFixed(0)}% of your ${b.category} budget.`,
            severity: 'warning',
            isRead: readSet.has(id),
            createdAt: now.toISOString(),
            metadata: { category: b.category, amount: spent },
          });
        }
      }

      // Savings goal milestones
      const { data: goals } = await sb
        .from('savings_goals')
        .select('*')
        .eq('user_id', userId);

      for (const g of goals ?? []) {
        const pct = g.target_amount > 0 ? (Number(g.current_amount) / Number(g.target_amount)) * 100 : 0;
        if (pct >= 90 && pct < 100) {
          const id = `notif_goal_milestone_${g.id}`;
          nots.push({
            id,
            type: 'goal_milestone',
            title: `Almost There! ${g.goal_name}`,
            message: `"${g.goal_name}" is ${pct.toFixed(0)}% funded. Only ₹${(Number(g.target_amount) - Number(g.current_amount)).toLocaleString('en-IN')} remaining!`,
            severity: 'info',
            isRead: readSet.has(id),
            createdAt: now.toISOString(),
            metadata: { goalName: g.goal_name, amount: Number(g.current_amount) },
          });
        }
      }

      // Recurring bills due in 7 days
      const { data: recurring } = await sb
        .from('recurring_payments')
        .select('*')
        .eq('user_id', userId);

      for (const r of recurring ?? []) {
        const nextDate = new Date(r.next_payment_date);
        const daysUntil = Math.floor((nextDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil >= 0 && daysUntil <= 7) {
          const id = `notif_bill_${r.id}`;
          nots.push({
            id,
            type: 'bill_due',
            title: `Bill Due Soon: ${r.name}`,
            message: `${r.name} of ₹${Number(r.amount).toLocaleString('en-IN')} is due in ${daysUntil === 0 ? 'today' : `${daysUntil} day(s)`}.`,
            severity: daysUntil <= 2 ? 'critical' : 'warning',
            isRead: readSet.has(id),
            createdAt: now.toISOString(),
            metadata: { amount: Number(r.amount) },
          });
        }
      }

      const severityOrder = { critical: 0, warning: 1, info: 2 };
      nots.sort((a, b) => {
        if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
        return (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      });

      return sendSuccess(res, {
        notifications: nots,
        unreadCount: nots.filter((n) => !n.isRead).length,
      });
    }

    // Demo path
    const nots = buildNotificationsForDemo(userId);
    return sendSuccess(res, {
      notifications: nots,
      unreadCount: nots.filter((n) => !n.isRead).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch notifications';
    return sendError(res, msg, 500, 'NOTIFICATION_FETCH_ERROR');
  }
}

// ---------------------------------------------------------------------------
// Controller: POST /api/notifications/:id/read
// ---------------------------------------------------------------------------

export async function markNotificationRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const notifId = req.params.id;

    if (!notifId) {
      return sendError(res, 'Notification ID is required', 400, 'VALIDATION_ERROR');
    }

    if (!readNotifications.has(userId)) {
      readNotifications.set(userId, new Set());
    }
    readNotifications.get(userId)!.add(notifId);

    return sendSuccess(res, { id: notifId, isRead: true }, 'Notification marked as read');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update notification';
    return sendError(res, msg, 500, 'NOTIFICATION_UPDATE_ERROR');
  }
}

// ---------------------------------------------------------------------------
// Controller: POST /api/notifications/read-all
// ---------------------------------------------------------------------------

export async function markAllNotificationsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const nots = buildNotificationsForDemo(userId);
    const readSet = new Set(nots.map((n) => n.id));
    readNotifications.set(userId, readSet);

    return sendSuccess(res, { markedRead: readSet.size }, 'All notifications marked as read');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update notifications';
    return sendError(res, msg, 500, 'NOTIFICATION_UPDATE_ERROR');
  }
}

