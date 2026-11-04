import { Request, Response } from 'express';
import { supabase, getSupabaseClient, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createRecurringSchema, updateRecurringSchema } from '../schemas/recurringSchema.js';
import { getTransactionsByUser, StoredTransaction } from './transactionController.js';

export interface StoredRecurringPayment {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_payment_date: string;
  status: 'active' | 'paused' | 'cancelled';
  is_user_confirmed: boolean;
  previous_dates?: string[];
  created_at: string;
}

let mockRecurringStore: StoredRecurringPayment[] = [
  {
    id: 'rec_demo_01',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Apartment Residential Rent',
    amount: 22000,
    category: 'Housing',
    frequency: 'monthly',
    next_payment_date: '2026-12-02',
    status: 'active',
    is_user_confirmed: true,
    previous_dates: ['2026-11-02', '2026-10-02', '2026-09-02'],
    created_at: '2026-09-01T00:00:00Z',
  },
  {
    id: 'rec_demo_02',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Electricity Power Bill',
    amount: 2850,
    category: 'Utilities',
    frequency: 'monthly',
    next_payment_date: '2026-12-08',
    status: 'active',
    is_user_confirmed: true,
    previous_dates: ['2026-11-08', '2026-10-08'],
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'rec_demo_03',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Netflix & Spotify Streaming Bundle',
    amount: 799,
    category: 'Entertainment',
    frequency: 'monthly',
    next_payment_date: '2026-12-10',
    status: 'active',
    is_user_confirmed: true,
    previous_dates: ['2026-11-10', '2026-10-10'],
    created_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'rec_demo_04',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Broadband Fiber Internet',
    amount: 1199,
    category: 'Utilities',
    frequency: 'monthly',
    next_payment_date: '2026-11-20',
    status: 'active',
    is_user_confirmed: false,
    previous_dates: ['2026-10-20', '2026-09-20'],
    created_at: '2026-10-21T00:00:00Z',
  },
  {
    id: 'rec_demo_05',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Gym & Fitness Membership',
    amount: 2500,
    category: 'Personal Care',
    frequency: 'monthly',
    next_payment_date: '2026-11-25',
    status: 'active',
    is_user_confirmed: false,
    previous_dates: ['2026-10-25'],
    created_at: '2026-10-26T00:00:00Z',
  },
];

let dismissedCandidateKeys = new Set<string>();

/**
 * Intelligent Recurring Detection Algorithm:
 * Scans transaction history to identify repeating outflow patterns.
 */
function detectRecurringFromTransactions(
  transactions: Array<{
    id?: string;
    title: string;
    amount: number;
    category: string;
    transaction_date?: string;
    transactionDate?: string;
    transaction_type?: string;
    transactionType?: string;
  }>,
  confirmedPayments: StoredRecurringPayment[]
): StoredRecurringPayment[] {
  const expenseTx = transactions.filter((t) => {
    const type = t.transaction_type || t.transactionType;
    return type === 'expense';
  });

  // Group by simplified title
  const groups: Record<
    string,
    Array<{ amount: number; date: string; category: string; title: string }>
  > = {};

  for (const tx of expenseTx) {
    const title = tx.title.trim();
    const normalizedKey = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!groups[normalizedKey]) {
      groups[normalizedKey] = [];
    }
    const d = tx.transaction_date || tx.transactionDate || '';
    groups[normalizedKey].push({
      amount: Number(tx.amount),
      date: d,
      category: tx.category,
      title,
    });
  }

  const detected: StoredRecurringPayment[] = [];

  for (const [key, items] of Object.entries(groups)) {
    if (dismissedCandidateKeys.has(key)) continue;

    // Check if already confirmed in recurring list
    const alreadyConfirmed = confirmedPayments.some((p) => {
      const pKey = p.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      return pKey === key || key.includes(pKey) || pKey.includes(key);
    });

    if (alreadyConfirmed) continue;

    // Needs at least 2 occurrences or is flagged as recurring
    if (items.length >= 2) {
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest = items[0];
      const previousDates = items.map((i) => i.date);

      // Estimate next date (30 days from latest occurrence)
      const lastDate = new Date(latest.date);
      const nextDate = new Date(lastDate);
      nextDate.setDate(nextDate.getDate() + 30);
      const nextDateStr = nextDate.toISOString().split('T')[0];

      detected.push({
        id: `detected_${key}_${items.length}`,
        user_id: '',
        title: latest.title,
        amount: latest.amount,
        category: latest.category,
        frequency: 'monthly',
        next_payment_date: nextDateStr,
        status: 'active',
        is_user_confirmed: false,
        previous_dates: previousDates,
        created_at: new Date().toISOString(),
      });
    }
  }

  return detected;
}

function formatRecurring(r: any) {
  return {
    id: r.id,
    userId: r.user_id || r.userId,
    title: r.title,
    amount: Number(r.amount),
    category: r.category,
    frequency: r.frequency,
    nextPaymentDate: r.next_payment_date || r.nextPaymentDate,
    status: r.status,
    isUserConfirmed: r.is_user_confirmed ?? r.isUserConfirmed ?? false,
    previousDates: r.previous_dates || r.previousDates || [],
    createdAt: r.created_at || r.createdAt,
  };
}

export async function getRecurringPayments(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);

      const [recurringRes, txRes] = await Promise.all([
        db.from('recurring_payments').select('*').eq('user_id', userId),
        db.from('transactions').select('*').eq('user_id', userId).eq('transaction_type', 'expense'),
      ]);

      const confirmedList: StoredRecurringPayment[] = recurringRes.data || [];
      const txList = txRes.data || [];

      const detectedList = detectRecurringFromTransactions(txList, confirmedList);

      const all = [...confirmedList, ...detectedList].map(formatRecurring);
      const confirmed = all.filter((p) => p.isUserConfirmed);
      const detected = all.filter((p) => !p.isUserConfirmed);

      const totalMonthlyOutflow = confirmed
        .filter((p) => p.status === 'active')
        .reduce((sum, p) => sum + p.amount, 0);

      return sendSuccess(res, {
        confirmed,
        detected,
        totalMonthlyOutflow,
      });
    }

    // In-memory demo path
    const userPayments = mockRecurringStore.filter(
      (p) => p.user_id === userId || !p.user_id
    );
    const userTx = getTransactionsByUser(userId);

    const autoDetected = detectRecurringFromTransactions(
      userTx,
      userPayments.filter((p) => p.is_user_confirmed)
    );

    const all = [...userPayments, ...autoDetected].map(formatRecurring);
    // Deduplicate by ID
    const uniqueMap = new Map<string, ReturnType<typeof formatRecurring>>();
    for (const item of all) {
      uniqueMap.set(item.id, item);
    }
    const uniqueItems = Array.from(uniqueMap.values());

    const confirmed = uniqueItems.filter((p) => p.isUserConfirmed);
    const detected = uniqueItems.filter((p) => !p.isUserConfirmed);
    const totalMonthlyOutflow = confirmed
      .filter((p) => p.status === 'active')
      .reduce((sum, p) => sum + p.amount, 0);

    return sendSuccess(res, {
      confirmed,
      detected,
      totalMonthlyOutflow,
    });
  } catch (err: any) {
    console.error('[getRecurringPayments Error]:', err);
    return sendError(res, 'Failed to fetch recurring payments', 500, 'SERVER_ERROR');
  }
}

export async function createRecurringPayment(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = createRecurringSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { title, amount, category, frequency, nextPaymentDate, status } = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data, error } = await db
        .from('recurring_payments')
        .insert({
          user_id: userId,
          title,
          amount,
          category,
          frequency,
          next_payment_date: nextPaymentDate,
          status,
          is_user_confirmed: true,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, error.message, 400, 'INSERT_ERROR');
      }

      return sendSuccess(res, formatRecurring(data), 'Recurring payment created successfully', 201);
    }

    const newPayment: StoredRecurringPayment = {
      id: 'rec_' + Date.now(),
      user_id: userId,
      title,
      amount,
      category,
      frequency,
      next_payment_date: nextPaymentDate,
      status,
      is_user_confirmed: true,
      previous_dates: [],
      created_at: new Date().toISOString(),
    };

    mockRecurringStore.unshift(newPayment);
    return sendSuccess(res, formatRecurring(newPayment), 'Recurring payment created successfully', 201);
  } catch (err: any) {
    return sendError(res, 'Failed to create recurring payment', 500, 'SERVER_ERROR');
  }
}

export async function confirmRecurringPayment(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data, error } = await db
        .from('recurring_payments')
        .update({ is_user_confirmed: true })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return sendError(res, 'Recurring payment not found', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, formatRecurring(data), 'Recurring payment confirmed');
    }

    const found = mockRecurringStore.find((p) => p.id === id);
    if (found) {
      found.is_user_confirmed = true;
      return sendSuccess(res, formatRecurring(found), 'Recurring payment confirmed');
    }

    // If it was dynamically detected, promote it to stored
    const promoted: StoredRecurringPayment = {
      id: 'rec_promoted_' + Date.now(),
      user_id: userId,
      title: req.body.title || 'Recurring Bill',
      amount: Number(req.body.amount || 0),
      category: req.body.category || 'Utilities',
      frequency: req.body.frequency || 'monthly',
      next_payment_date: req.body.nextPaymentDate || new Date().toISOString().split('T')[0],
      status: 'active',
      is_user_confirmed: true,
      created_at: new Date().toISOString(),
    };
    mockRecurringStore.unshift(promoted);

    return sendSuccess(res, formatRecurring(promoted), 'Recurring payment confirmed');
  } catch (err: any) {
    return sendError(res, 'Failed to confirm recurring payment', 500, 'SERVER_ERROR');
  }
}

export async function dismissRecurringPayment(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const normalizedKey = id.replace('detected_', '').split('_')[0];
    if (normalizedKey) {
      dismissedCandidateKeys.add(normalizedKey);
    }

    mockRecurringStore = mockRecurringStore.filter((p) => p.id !== id);

    return sendSuccess(res, { id }, 'Detected recurring payment dismissed');
  } catch (err: any) {
    return sendError(res, 'Failed to dismiss recurring payment', 500, 'SERVER_ERROR');
  }
}

export async function updateRecurringPayment(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateRecurringSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const updatePayload: Record<string, any> = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.amount !== undefined) updatePayload.amount = updates.amount;
      if (updates.category !== undefined) updatePayload.category = updates.category;
      if (updates.frequency !== undefined) updatePayload.frequency = updates.frequency;
      if (updates.nextPaymentDate !== undefined) updatePayload.next_payment_date = updates.nextPaymentDate;
      if (updates.status !== undefined) updatePayload.status = updates.status;

      const { data, error } = await db
        .from('recurring_payments')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error || !data) {
        return sendError(res, 'Recurring payment not found', 404, 'NOT_FOUND');
      }

      return sendSuccess(res, formatRecurring(data), 'Recurring payment updated');
    }

    const found = mockRecurringStore.find((p) => p.id === id);
    if (!found) {
      return sendError(res, 'Recurring payment not found', 404, 'NOT_FOUND');
    }

    if (updates.title !== undefined) found.title = updates.title;
    if (updates.amount !== undefined) found.amount = updates.amount;
    if (updates.category !== undefined) found.category = updates.category;
    if (updates.frequency !== undefined) found.frequency = updates.frequency;
    if (updates.nextPaymentDate !== undefined) found.next_payment_date = updates.nextPaymentDate;
    if (updates.status !== undefined) found.status = updates.status;

    return sendSuccess(res, formatRecurring(found), 'Recurring payment updated');
  } catch (err: any) {
    return sendError(res, 'Failed to update recurring payment', 500, 'SERVER_ERROR');
  }
}

export async function deleteRecurringPayment(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { error } = await db
        .from('recurring_payments')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return sendError(res, error.message, 400, 'DELETE_ERROR');
      }
      return sendSuccess(res, { id }, 'Recurring payment deleted');
    }

    const initLen = mockRecurringStore.length;
    mockRecurringStore = mockRecurringStore.filter((p) => p.id !== id);

    if (mockRecurringStore.length === initLen) {
      return sendError(res, 'Recurring payment not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Recurring payment deleted');
  } catch (err: any) {
    return sendError(res, 'Failed to delete recurring payment', 500, 'SERVER_ERROR');
  }
}

