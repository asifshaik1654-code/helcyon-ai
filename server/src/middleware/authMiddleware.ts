import { Request, Response, NextFunction } from 'express';
import { supabase, isSupabaseLive } from '../config/supabase.js';
import { sendError } from '../utils/response.js';
import '../types/auth.js';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    // Demo Mode Token Support (For offline evaluation and tests)
    if (token === 'demo-session-token' || token === 'demo-token') {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'asif.shaik@helcyon.ai',
        fullName: 'Shaik Asif (Demo)',
        role: 'authenticated',
      };
      return next();
    }

    if (!isSupabaseLive) {
      // If Supabase credentials are not populated in .env, permit mock session
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@helcyon.ai',
        fullName: 'Local Developer',
        role: 'authenticated',
      };
      return next();
    }

    // Verify token with Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return sendError(
        res,
        error?.message || 'Invalid or expired authentication session',
        401,
        'INVALID_TOKEN'
      );
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
      fullName: data.user.user_metadata?.full_name || 'Helcyon User',
      role: data.user.role,
    };

    return next();
  } catch (err: any) {
    console.error('[AuthMiddleware Exception]:', err);
    return sendError(res, 'Authentication verification failure', 500, 'AUTH_ERROR');
  }
}

