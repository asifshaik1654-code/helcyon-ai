import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  preferredCurrency: z.string().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  onboardingCompleted: z.boolean().optional(),
});

export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!isSupabaseLive || userId === '00000000-0000-0000-0000-000000000001') {
      return sendSuccess(res, {
        id: userId,
        fullName: req.user?.fullName || 'Shaik Asif',
        email: req.user?.email || 'asif.shaik@helcyon.ai',
        preferredCurrency: 'INR',
        monthlyIncome: 85000,
        onboardingCompleted: true,
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return sendError(res, error.message, 404, 'PROFILE_NOT_FOUND');
    }

    return sendSuccess(res, data, 'User profile retrieved');
  } catch (err: any) {
    return sendError(res, 'Failed to fetch profile', 500, 'SERVER_ERROR');
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    const parseResult = updateProfileSchema.safeParse(req.body);

    if (!parseResult.success) {
      return sendError(res, parseResult.error.errors[0].message, 400, 'VALIDATION_ERROR');
    }

    const updates = parseResult.data;

    if (!isSupabaseLive || userId === '00000000-0000-0000-0000-000000000001') {
      return sendSuccess(
        res,
        {
          id: userId,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        'Profile updated successfully (Demo Mode)'
      );
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        preferred_currency: updates.preferredCurrency,
        monthly_income: updates.monthlyIncome,
        onboarding_completed: updates.onboardingCompleted,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return sendError(res, error.message, 400, 'UPDATE_FAILED');
    }

    return sendSuccess(res, data, 'Profile updated successfully');
  } catch (err: any) {
    return sendError(res, 'Failed to update profile', 500, 'SERVER_ERROR');
  }
}

