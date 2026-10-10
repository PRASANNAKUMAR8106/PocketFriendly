import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  (rawUrl.startsWith('https://') || rawUrl.startsWith('http://')) &&
  !rawUrl.includes('placeholder') &&
  !rawUrl.includes('your-project') &&
  !rawUrl.includes('example.com') &&
  !rawKey.includes('placeholder') &&
  !rawKey.includes('your-anon-key') &&
  !rawKey.includes('your-actual-anon-key') &&
  rawKey.length > 20
);

// Real or fallback Supabase client
export const supabase = createClient(
  isSupabaseConfigured ? rawUrl : 'https://placeholder-pfs.supabase.co',
  isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
