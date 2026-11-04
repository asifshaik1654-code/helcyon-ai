import { createClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

const isConfigured =
  ENV.SUPABASE_URL &&
  !ENV.SUPABASE_URL.includes('your-project') &&
  !ENV.SUPABASE_URL.includes('mock.supabase.co');

if (!isConfigured) {
  console.log('------------------------------------------------------------');
  console.log('[Supabase Config Notice]: No external Supabase URL configured in .env.');
  console.log('Operating in Local Developer / Presentation Demo Mode.');
  console.log('------------------------------------------------------------');
}

export const supabase = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-role-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const isSupabaseLive = isConfigured;
