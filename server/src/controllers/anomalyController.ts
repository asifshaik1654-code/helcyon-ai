import { Request, Response } from 'express';
import { supabase, getSupabaseClient, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { getTransactionsByUser, StoredTransaction } from './transactionController.js';

export interface AnomalyInsight {
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

let dismissedAnomalyIds = new Set<string>();

export async function getAnomalies(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    let transactions: any[] = [];

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data } = await db
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false });
      transactions = data || [];
    } else {
      transactions = getTransactionsByUser(userId);
    }

    const expenses = transactions.filter((t) => {
      const type = t.transaction_type || t.transactionType;
      return type === 'expense';
    });

    // 1. Group by category to compute statistical baselines
    const categoryStats: Record<
      string,
      { amounts: number[]; sum: number; mean: number; stdDev: number }
    > = {};

    for (const t of expenses) {
      const cat = t.category || 'Other';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { amounts: [], sum: 0, mean: 0, stdDev: 0 };
      }
      const amt = Number(t.amount);
      categoryStats[cat].amounts.push(amt);
      categoryStats[cat].sum += amt;
    }

    // Compute mean and standard deviation per category
    for (const [cat, stat] of Object.entries(categoryStats)) {
      const n = stat.amounts.length;
      if (n > 0) {
        stat.mean = stat.sum / n;
        const variance =
          stat.amounts.reduce((acc, a) => acc + Math.pow(a - stat.mean, 2), 0) / n;
        stat.stdDev = Math.sqrt(variance);
      }
    }

    const anomalies: AnomalyInsight[] = [];

    // 2. Check 1: Individual Transaction Outlier Spikes
    for (const t of expenses) {
      const cat = t.category || 'Other';
      const stat = categoryStats[cat];
      const amt = Number(t.amount);
      const date = t.transaction_date || t.transactionDate;
      const title = t.title;
      const id = `spike_${t.id}`;

      if (dismissedAnomalyIds.has(id)) continue;

      // If category has at least 2 historical transactions and this transaction is > 2.2x the average
      if (stat && stat.amounts.length >= 2 && amt > stat.mean * 2.2 && amt > 1000) {
        const multiple = (amt / stat.mean).toFixed(1);
        const severity: AnomalyInsight['severity'] =
          amt > stat.mean * 3.5 ? 'critical' : 'warning';

        anomalies.push({
          id,
          type: 'spike',
          title: `Unusual Spending Spike in ${cat}`,
          category: cat,
          severity,
          amount: amt,
          date,
          explanation: `Your expense of ₹${amt.toLocaleString()} on "${title}" is ${multiple}x higher than your historical average of ₹${Math.round(
            stat.mean
          ).toLocaleString()} for ${cat}.`,
          isDismissed: false,
          metadata: {
            transactionId: t.id,
            average: Math.round(stat.mean),
            multiple,
          },
        });
      }
    }

    // 3. Check 2: Potential Duplicate Charges on Same Day
    const seenSameDay: Record<string, any[]> = {};
    for (const t of expenses) {
      const d = t.transaction_date || t.transactionDate;
      const amt = Number(t.amount);
      const title = t.title.trim().toLowerCase();
      const key = `${d}_${title}_${amt}`;
      if (!seenSameDay[key]) {
        seenSameDay[key] = [];
      }
      seenSameDay[key].push(t);
    }

    for (const [key, duplicates] of Object.entries(seenSameDay)) {
      const id = `dup_${key}`;
      if (dismissedAnomalyIds.has(id)) continue;

      if (duplicates.length >= 2) {
        const first = duplicates[0];
        const amt = Number(first.amount);
        const d = first.transaction_date || first.transactionDate;

        anomalies.push({
          id,
          type: 'duplicate_check',
          title: `Potential Duplicate Charge Flagged`,
          category: first.category,
          severity: 'info',
          amount: amt,
          date: d,
          explanation: `We noticed ${duplicates.length} identical transactions of ₹${amt.toLocaleString()} on ${d} for "${first.title}". Verify this was intentional and not a double charge.`,
          isDismissed: false,
          metadata: {
            count: duplicates.length,
            title: first.title,
          },
        });
      }
    }

    // Sort by severity (critical first) then date descending
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    anomalies.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return sendSuccess(res, {
      anomalies,
      totalFlagged: anomalies.length,
      categoriesAnalyzed: Object.keys(categoryStats).length,
    });
  } catch (err: any) {
    console.error('[getAnomalies Error]:', err);
    return sendError(res, 'Failed to compute spending anomalies', 500, 'SERVER_ERROR');
  }
}

export async function dismissAnomaly(req: Request, res: Response) {
  try {
    const { id } = req.params;
    dismissedAnomalyIds.add(id);
    return sendSuccess(res, { id }, 'Anomaly dismissed from observation list');
  } catch (err: any) {
    return sendError(res, 'Failed to dismiss anomaly', 500, 'SERVER_ERROR');
  }
}

