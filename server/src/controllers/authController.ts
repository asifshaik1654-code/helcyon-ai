import { Request, Response } from 'express';
import { z } from 'zod';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendSuccess, sendError } from '../utils/response.js';

const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  preferredCurrency: z.string().default('INR'),
  monthlyIncome: z.number().optional().default(0),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export async function register(req: Request, res: Response) {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        parseResult.error.errors[0].message,
        400,
        'VALIDATION_ERROR',
        parseResult.error.errors
      );
    }

    const { email, password, fullName, preferredCurrency, monthlyIncome } = parseResult.data;

    // Demo Mode handling when Supabase is not connected
    if (!isSupabaseLive) {
      return sendSuccess(
        res,
        {
          user: {
            id: 'usr_' + Date.now(),
            email,
            fullName,
            preferredCurrency,
            monthlyIncome,
          },
          session: {
            accessToken: 'demo-session-token',
            expiresIn: 3600,
          },
        },
        'User registration simulated successfully (Development Mode)',
        201
      );
    }

    // Live Supabase Auth Sign Up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          preferred_currency: preferredCurrency,
          monthly_income: monthlyIncome,
        },
      },
    });

    if (error) {
      return sendError(res, error.message, 400, 'REGISTRATION_FAILED');
    }

    return sendSuccess(
      res,
      {
        user: data.user,
        session: data.session,
      },
      'Registration successful. Please verify email if confirmation is enabled.',
      201
    );
  } catch (err: any) {
    console.error('[Register Controller Error]:', err);
    return sendError(res, 'Internal registration error', 500, 'SERVER_ERROR');
  }
}

export async function login(req: Request, res: Response) {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return sendError(
        res,
        parseResult.error.errors[0].message,
        400,
        'VALIDATION_ERROR',
        parseResult.error.errors
      );
    }

    const { email, password } = parseResult.data;

    // Check for quick demo login
    if (email === 'asif.shaik@helcyon.ai' || !isSupabaseLive) {
      return sendSuccess(
        res,
        {
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'asif.shaik@helcyon.ai',
            fullName: 'Shaik Asif (Demo)',
            preferredCurrency: 'INR',
            monthlyIncome: 85000,
          },
          session: {
            accessToken: 'demo-session-token',
            expiresIn: 86400,
          },
        },
        'Sign in successful'
      );
    }

    // Live Supabase Authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return sendError(res, error.message, 401, 'INVALID_CREDENTIALS');
    }

    return sendSuccess(
      res,
      {
        user: data.user,
        session: data.session,
      },
      'Sign in successful'
    );
  } catch (err: any) {
    console.error('[Login Controller Error]:', err);
    return sendError(res, 'Internal authentication error', 500, 'SERVER_ERROR');
  }
}

export async function logout(_req: Request, res: Response) {
  try {
    if (isSupabaseLive) {
      await supabase.auth.signOut();
    }
    return sendSuccess(res, null, 'User signed out successfully');
  } catch (err: any) {
    return sendError(res, 'Error during logout', 500, 'LOGOUT_ERROR');
  }
}

export async function getMe(req: Request, res: Response) {
  return sendSuccess(
    res,
    {
      user: req.user,
    },
    'Current authenticated session retrieved'
  );
}
