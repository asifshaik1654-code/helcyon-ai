import { Request, Response } from 'express';
import { supabase, getSupabaseClient, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionSchema,
  importBatchSchema,
} from '../schemas/transactionSchema.js';

// Local In-Memory Fallback Store for Local Development & Demo Presentation
export interface StoredTransaction {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  category: string;
  transaction_date: string;
  payment_method: string;
  description: string;
  is_recurring: boolean;
  created_at: string;
  updated_at: string;
}

export function getTransactionsByUser(userId: string): StoredTransaction[] {
  return mockTransactionsStore.filter((t) => t.user_id === userId);
}

let mockTransactionsStore: StoredTransaction[] = [
  {
    id: 'tx_demo_01',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Monthly Tech Salary',
    amount: 85000.00,
    transaction_type: 'income',
    category: 'Salary',
    transaction_date: '2026-11-01',
    payment_method: 'Bank Transfer',
    description: 'Tech Corp monthly payroll credited',
    is_recurring: false,
    created_at: '2026-11-01T09:30:00Z',
    updated_at: '2026-11-01T09:30:00Z',
  },
  {
    id: 'tx_demo_02',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Apartment Monthly Rent',
    amount: 22000.00,
    transaction_type: 'expense',
    category: 'Housing',
    transaction_date: '2026-11-02',
    payment_method: 'Net Banking',
    description: '2BHK Apartment rent paid to owner',
    is_recurring: true,
    created_at: '2026-11-02T11:00:00Z',
    updated_at: '2026-11-02T11:00:00Z',
  },
  {
    id: 'tx_demo_03',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Supermarket Groceries & Staples',
    amount: 4250.00,
    transaction_type: 'expense',
    category: 'Groceries',
    transaction_date: '2026-11-03',
    payment_method: 'UPI',
    description: 'Weekly household essentials and provisions',
    is_recurring: false,
    created_at: '2026-11-03T18:45:00Z',
    updated_at: '2026-11-03T18:45:00Z',
  },
  {
    id: 'tx_demo_04',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'High-Speed Fiber Broadband',
    amount: 1199.00,
    transaction_type: 'expense',
    category: 'Utilities',
    transaction_date: '2026-11-04',
    payment_method: 'UPI',
    description: 'Airtel 300 Mbps monthly fiber subscription',
    is_recurring: true,
    created_at: '2026-11-04T14:15:00Z',
    updated_at: '2026-11-04T14:15:00Z',
  },
  {
    id: 'tx_demo_05',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Weekend Bistro Dinner',
    amount: 2450.00,
    transaction_type: 'expense',
    category: 'Food & Dining',
    transaction_date: '2026-11-05',
    payment_method: 'Credit Card',
    description: 'Dinner with college friends at Olive Bistro',
    is_recurring: false,
    created_at: '2026-11-05T21:30:00Z',
    updated_at: '2026-11-05T21:30:00Z',
  },
  {
    id: 'tx_demo_06',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Freelance UI/UX Web Project',
    amount: 18500.00,
    transaction_type: 'income',
    category: 'Freelance',
    transaction_date: '2026-11-07',
    payment_method: 'Bank Transfer',
    description: 'Landing page design milestone for FinTech client',
    is_recurring: false,
    created_at: '2026-11-07T16:00:00Z',
    updated_at: '2026-11-07T16:00:00Z',
  },
  {
    id: 'tx_demo_07',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Electricity Power Bill',
    amount: 2850.00,
    transaction_type: 'expense',
    category: 'Utilities',
    transaction_date: '2026-11-08',
    payment_method: 'UPI',
    description: 'State electricity board residential power bill',
    is_recurring: true,
    created_at: '2026-11-08T10:20:00Z',
    updated_at: '2026-11-08T10:20:00Z',
  },
  {
    id: 'tx_demo_08',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Metro Smart Card Transit Recharge',
    amount: 1500.00,
    transaction_type: 'expense',
    category: 'Transport',
    transaction_date: '2026-11-09',
    payment_method: 'UPI',
    description: 'Monthly transit commute pass recharge',
    is_recurring: false,
    created_at: '2026-11-09T08:10:00Z',
    updated_at: '2026-11-09T08:10:00Z',
  },
  {
    id: 'tx_demo_09',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Netflix & Spotify Premium',
    amount: 799.00,
    transaction_type: 'expense',
    category: 'Entertainment',
    transaction_date: '2026-11-10',
    payment_method: 'Credit Card',
    description: 'Monthly streaming bundle auto-debit',
    is_recurring: true,
    created_at: '2026-11-10T02:00:00Z',
    updated_at: '2026-11-10T02:00:00Z',
  },
  {
    id: 'tx_demo_10',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Books & Technical Courses',
    amount: 1899.00,
    transaction_type: 'expense',
    category: 'Education',
    transaction_date: '2026-11-11',
    payment_method: 'Debit Card',
    description: 'Full-stack software architecture tutorial bundle',
    is_recurring: false,
    created_at: '2026-11-11T13:40:00Z',
    updated_at: '2026-11-11T13:40:00Z',
  },
];

function formatTransaction(t: any) {
  return {
    id: t.id,
    userId: t.user_id || t.userId,
    title: t.title,
    amount: Number(t.amount),
    transactionType: t.transaction_type || t.transactionType,
    category: t.category,
    transactionDate: t.transaction_date || t.transactionDate,
    paymentMethod: t.payment_method || t.paymentMethod,
    description: t.description || undefined,
    isRecurring: t.is_recurring ?? t.isRecurring ?? false,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
  };
}

export async function getTransactions(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = queryTransactionSchema.safeParse(req.query);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const { page, limit, search, type, category, startDate, endDate, sortBy, sortOrder } =
      parseResult.data;

    // Supabase Live Query Path
    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      let query = db
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      if (type && type !== 'all') {
        query = query.eq('transaction_type', type);
      }
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }
      if (startDate) {
        query = query.gte('transaction_date', startDate);
      }
      if (endDate) {
        query = query.lte('transaction_date', endDate);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const ascending = sortOrder === 'asc';
      query = query.order(sortBy, { ascending });

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) {
        return sendError(res, error.message, 400, 'QUERY_ERROR');
      }

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / limit);

      return sendSuccess(res, {
        items: (data || []).map(formatTransaction),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    // Local / In-Memory Filtered & Paginated Path
    let filtered = mockTransactionsStore.filter((t) => t.user_id === userId);

    if (type && type !== 'all') {
      filtered = filtered.filter((t) => t.transaction_type === type);
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((t) => t.category === category);
    }
    if (startDate) {
      filtered = filtered.filter((t) => t.transaction_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.transaction_date <= endDate);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let valA: any = a[sortBy as keyof StoredTransaction];
      let valB: any = b[sortBy as keyof StoredTransaction];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIdx = (page - 1) * limit;
    const paginated = filtered.slice(startIdx, startIdx + limit);

    return sendSuccess(res, {
      items: paginated.map(formatTransaction),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (err: any) {
    console.error('[getTransactions Error]:', err);
    return sendError(res, 'Failed to fetch transactions', 500, 'SERVER_ERROR');
  }
}

export async function getTransactionById(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data, error } = await db
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
      }
      return sendSuccess(res, formatTransaction(data));
    }

    const found = mockTransactionsStore.find((t) => t.id === id && t.user_id === userId);
    if (!found) {
      return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, formatTransaction(found));
  } catch (err: any) {
    return sendError(res, 'Failed to retrieve transaction', 500, 'SERVER_ERROR');
  }
}

export async function createTransaction(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = createTransactionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const data = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data: inserted, error } = await db
        .from('transactions')
        .insert({
          user_id: userId,
          title: data.title,
          amount: data.amount,
          transaction_type: data.transactionType,
          category: data.category,
          transaction_date: data.transactionDate,
          payment_method: data.paymentMethod,
          description: data.description,
          is_recurring: data.isRecurring,
        })
        .select()
        .single();

      if (error) {
        return sendError(res, error.message, 400, 'INSERT_FAILED');
      }

      return sendSuccess(res, formatTransaction(inserted), 'Transaction recorded successfully', 201);
    }

    // Local / In-Memory Mock Path
    const newTx: StoredTransaction = {
      id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      title: data.title,
      amount: data.amount,
      transaction_type: data.transactionType,
      category: data.category,
      transaction_date: data.transactionDate,
      payment_method: data.paymentMethod,
      description: data.description || '',
      is_recurring: data.isRecurring || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockTransactionsStore.unshift(newTx);
    return sendSuccess(res, formatTransaction(newTx), 'Transaction recorded successfully', 201);
  } catch (err: any) {
    console.error('[createTransaction Error]:', err);
    return sendError(res, 'Failed to record transaction', 500, 'SERVER_ERROR');
  }
}

export async function updateTransaction(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const parseResult = updateTransactionSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parseResult.data;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const updatePayload: any = {};
      if (updates.title !== undefined) updatePayload.title = updates.title;
      if (updates.amount !== undefined) updatePayload.amount = updates.amount;
      if (updates.transactionType !== undefined) updatePayload.transaction_type = updates.transactionType;
      if (updates.category !== undefined) updatePayload.category = updates.category;
      if (updates.transactionDate !== undefined) updatePayload.transaction_date = updates.transactionDate;
      if (updates.paymentMethod !== undefined) updatePayload.payment_method = updates.paymentMethod;
      if (updates.description !== undefined) updatePayload.description = updates.description;
      if (updates.isRecurring !== undefined) updatePayload.is_recurring = updates.isRecurring;

      const { data, error } = await supabase
        .from('transactions')
        .update(updatePayload)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        return sendError(res, error.message, 400, 'UPDATE_FAILED');
      }

      return sendSuccess(res, formatTransaction(data), 'Transaction updated successfully');
    }

    const index = mockTransactionsStore.findIndex((t) => t.id === id && t.user_id === userId);
    if (index === -1) {
      return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
    }

    const existing = mockTransactionsStore[index];
    const updatedTx: StoredTransaction = {
      ...existing,
      title: updates.title !== undefined ? updates.title : existing.title,
      amount: updates.amount !== undefined ? updates.amount : existing.amount,
      transaction_type: updates.transactionType !== undefined ? updates.transactionType : existing.transaction_type,
      category: updates.category !== undefined ? updates.category : existing.category,
      transaction_date: updates.transactionDate !== undefined ? updates.transactionDate : existing.transaction_date,
      payment_method: updates.paymentMethod !== undefined ? updates.paymentMethod : existing.payment_method,
      description: updates.description !== undefined ? updates.description : existing.description,
      is_recurring: updates.isRecurring !== undefined ? updates.isRecurring : existing.is_recurring,
      updated_at: new Date().toISOString(),
    };

    mockTransactionsStore[index] = updatedTx;
    return sendSuccess(res, formatTransaction(updatedTx), 'Transaction updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update transaction', 500, 'SERVER_ERROR');
  }
}

export async function deleteTransaction(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { error } = await db
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        return sendError(res, error.message, 400, 'DELETE_FAILED');
      }

      return sendSuccess(res, { id }, 'Transaction deleted successfully');
    }

    const initialLen = mockTransactionsStore.length;
    mockTransactionsStore = mockTransactionsStore.filter(
      (t) => !(t.id === id && t.user_id === userId)
    );

    if (mockTransactionsStore.length === initialLen) {
      return sendError(res, 'Transaction not found', 404, 'NOT_FOUND');
    }

    return sendSuccess(res, { id }, 'Transaction deleted successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to delete transaction', 500, 'SERVER_ERROR');
  }
}

export async function importTransactions(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const parseResult = importBatchSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const incoming = parseResult.data.transactions;
    let existingList: { title: string; amount: number; transaction_date: string }[] = [];

    // Fetch existing records for duplicate detection
    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data } = await db
        .from('transactions')
        .select('title, amount, transaction_date')
        .eq('user_id', userId);
      existingList = data || [];
    } else {
      existingList = mockTransactionsStore.filter((t) => t.user_id === userId);
    }

    // Duplicate detection helper: match date, amount, and case-insensitive title
    const isDuplicate = (candidate: (typeof incoming)[0]) => {
      return existingList.some(
        (ex) =>
          ex.transaction_date === candidate.transactionDate &&
          Math.abs(Number(ex.amount) - candidate.amount) < 0.01 &&
          ex.title.trim().toLowerCase() === candidate.title.trim().toLowerCase()
      );
    };

    const toInsert = incoming.filter((item) => !isDuplicate(item));
    const duplicateCount = incoming.length - toInsert.length;

    if (toInsert.length === 0) {
      return sendSuccess(
        res,
        {
          totalSubmitted: incoming.length,
          importedCount: 0,
          skippedDuplicates: duplicateCount,
        },
        'All submitted transactions were identified as duplicates and skipped.'
      );
    }

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const rows = toInsert.map((t) => ({
        user_id: userId,
        title: t.title,
        amount: t.amount,
        transaction_type: t.transactionType,
        category: t.category,
        transaction_date: t.transactionDate,
        payment_method: t.paymentMethod,
        description: t.description,
        is_recurring: t.isRecurring,
      }));

      const db = getSupabaseClient(req.token);
      const { data, error } = await db.from('transactions').insert(rows).select();

      if (error) {
        return sendError(res, error.message, 400, 'IMPORT_FAILED');
      }

      return sendSuccess(
        res,
        {
          imported: data?.length || toInsert.length,
          skipped: duplicateCount,
          errors: 0,
          total: incoming.length,
          details: {
            importedItems: (data || []).map(formatTransaction),
            skippedReasons: duplicateCount > 0 ? [`${duplicateCount} duplicate records skipped`] : [],
          },
        },
        `Successfully imported ${data?.length || toInsert.length} transactions (${duplicateCount} duplicates skipped).`,
        201
      );
    }

    // Local in-memory import
    const newItems: StoredTransaction[] = toInsert.map((t) => ({
      id: 'tx_imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      user_id: userId,
      title: t.title,
      amount: t.amount,
      transaction_type: t.transactionType,
      category: t.category,
      transaction_date: t.transactionDate,
      payment_method: t.paymentMethod,
      description: t.description || '',
      is_recurring: t.isRecurring || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    mockTransactionsStore.unshift(...newItems);

    return sendSuccess(
      res,
      {
        imported: newItems.length,
        skipped: duplicateCount,
        errors: 0,
        total: incoming.length,
        details: {
          importedItems: newItems.map(formatTransaction),
          skippedReasons: duplicateCount > 0 ? [`${duplicateCount} duplicate records skipped`] : [],
        },
      },
      `Successfully imported ${newItems.length} transactions (${duplicateCount} duplicates skipped).`,
      201
    );
  } catch (err: any) {
    console.error('[importTransactions Error]:', err);
    return sendError(res, 'Batch import failed', 500, 'SERVER_ERROR');
  }
}

export async function getTransactionSummary(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    let list: StoredTransaction[] = [];

    if (isSupabaseLive && userId !== '00000000-0000-0000-0000-000000000001') {
      const db = getSupabaseClient(req.token);
      const { data, error } = await db
        .from('transactions')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        return sendError(res, error.message, 400, 'QUERY_ERROR');
      }
      list = (data as any) || [];
    } else {
      list = mockTransactionsStore.filter((t) => t.user_id === userId);
    }

    const incomeList = list.filter((t) => t.transaction_type === 'income');
    const expenseList = list.filter((t) => t.transaction_type === 'expense');

    const totalIncome = incomeList.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = expenseList.reduce((sum, t) => sum + Number(t.amount), 0);
    const availableBalance = totalIncome - totalExpenses;

    const categoryMap: Record<string, { total: number; count: number }> = {};
    for (const t of list) {
      const cat = t.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, count: 0 };
      }
      categoryMap[cat].total += Number(t.amount);
      categoryMap[cat].count += 1;
    }

    const byCategory = Object.entries(categoryMap).map(([category, val]) => ({
      category,
      total: val.total,
      count: val.count,
      percentage: totalExpenses > 0 ? (val.total / totalExpenses) * 100 : 0,
    }));

    return sendSuccess(res, {
      totalIncome,
      totalExpenses,
      availableBalance,
      transactionCount: list.length,
      incomeCount: incomeList.length,
      expenseCount: expenseList.length,
      byCategory,
    });
  } catch (err: any) {
    return sendError(res, 'Failed to compute transaction summary', 500, 'SERVER_ERROR');
  }
}

