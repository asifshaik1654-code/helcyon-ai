import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isConfigured =
  supabaseUrl.length > 0 &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 0 &&
  !supabaseAnonKey.includes('your-supabase');

export const isSupabaseFrontendConfigured = isConfigured;

// Provide a safe placeholder client if environment variables are not yet populated
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://mock.supabase.co',
  isConfigured ? supabaseAnonKey : 'mock-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
