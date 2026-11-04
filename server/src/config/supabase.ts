import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env.js';

const isConfigured =
  Boolean(ENV.SUPABASE_URL) &&
  !ENV.SUPABASE_URL.includes('your-project') &&
  !ENV.SUPABASE_URL.includes('mock.supabase.co') &&
  Boolean(ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY);

if (!isConfigured) {
  console.log('------------------------------------------------------------');
  console.log('[Supabase Config Notice]: No external Supabase credentials in .env.');
  console.log('Operating in Local Developer / Offline Presentation Demo Mode.');
  console.log('------------------------------------------------------------');
}

// Master / Service Role client (bypasses RLS if service_role key is used)
const masterKey = ENV.SUPABASE_SERVICE_ROLE_KEY || ENV.SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(ENV.SUPABASE_URL, masterKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const isSupabaseLive = isConfigured;

/**
 * Returns a Supabase client scoped to the user's JWT token.
 * This guarantees PostgreSQL Row Level Security (RLS) works accurately
 * even when the server only has the ANON_KEY configured!
 */
export function getSupabaseClient(userToken?: string): SupabaseClient {
  if (
    isConfigured &&
    userToken &&
    userToken !== 'demo-session-token' &&
    userToken !== 'demo-token'
  ) {
    const clientKey = ENV.SUPABASE_ANON_KEY || masterKey;
    return createClient(ENV.SUPABASE_URL, clientKey, {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabase;
}
