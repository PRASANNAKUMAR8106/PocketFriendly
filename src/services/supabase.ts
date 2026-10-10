import { createClient } from '@supabase/supabase-js';

// Resolve variable from any supported environment variable alias
function resolveEnv(...names: string[]): string {
  for (const name of names) {
    let val = (import.meta.env[name] as string | undefined)?.trim();
    if (val) {
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      return val;
    }
  }
  return '';
}

// Support standard Vite, Supabase CLI, and Next.js public naming conventions
export const rawSupabaseUrl = resolveEnv(
  'VITE_SUPABASE_URL',
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL'
).replace(/\/+$/, '');

export const rawSupabaseKey = resolveEnv(
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_KEY',
  'VITE_SUPABASE_PUBLIC_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
);

// Security: Inspect key to guarantee service_role secret key is NEVER used in frontend
export function isUnsafeSecretKey(key: string): boolean {
  if (!key) return false;
  const lower = key.toLowerCase();
  if (lower.includes('service_role') || lower.startsWith('sb_secret_') || lower.includes('secret_key')) {
    return true;
  }

  // Inspect JWT payload if formatted as a JWT (header.payload.signature)
  try {
    const parts = key.split('.');
    if (parts.length === 3) {
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = atob(b64);
      const parsed = JSON.parse(json);
      if (parsed && (parsed.role === 'service_role' || parsed.role === 'postgres')) {
        return true;
      }
    }
  } catch {
    // Non-JWT key format (e.g. modern sbp_ publishable token)
  }

  return false;
}

// Detect key type: Publishable key (sbp_...) or legacy JWT anon key (eyJ...)
export function getDetectedKeyType(key: string): 'publishable' | 'anon' | 'service_role' | 'unknown' | 'none' {
  if (!key) return 'none';
  if (isUnsafeSecretKey(key)) return 'service_role';
  if (key.startsWith('sbp_')) return 'publishable';
  if (key.startsWith('eyJ')) return 'anon';
  if (key.length >= 20) return 'publishable';
  return 'unknown';
}

export const hasServiceRoleViolation = isUnsafeSecretKey(rawSupabaseKey);

const isPlaceholderUrl =
  !rawSupabaseUrl ||
  rawSupabaseUrl.includes('placeholder') ||
  rawSupabaseUrl.includes('your-project') ||
  rawSupabaseUrl.includes('example.com') ||
  !(rawSupabaseUrl.startsWith('https://') || rawSupabaseUrl.startsWith('http://'));

const isPlaceholderKey =
  !rawSupabaseKey ||
  rawSupabaseKey.includes('placeholder') ||
  rawSupabaseKey.includes('your-anon-key') ||
  rawSupabaseKey.includes('your-publishable-key') ||
  rawSupabaseKey.includes('your-actual-anon-key') ||
  rawSupabaseKey.length < 15;

export const isSupabaseConfigured = Boolean(
  !isPlaceholderUrl &&
  !isPlaceholderKey &&
  !hasServiceRoleViolation
);

// Diagnostic configuration status
export const supabaseConfigStatus = {
  url: rawSupabaseUrl || 'Not set',
  keyType: getDetectedKeyType(rawSupabaseKey),
  isConfigured: isSupabaseConfigured,
  hasServiceRoleViolation,
  isPlaceholder: isPlaceholderUrl || isPlaceholderKey,
  missingVariables: [
    !rawSupabaseUrl ? 'VITE_SUPABASE_URL' : null,
    !rawSupabaseKey ? 'VITE_SUPABASE_ANON_KEY or VITE_SUPABASE_PUBLISHABLE_KEY' : null,
  ].filter(Boolean) as string[],
};

// Real client when configured; safe fallback client when unconfigured
export const supabase = createClient(
  isSupabaseConfigured ? rawSupabaseUrl : 'https://placeholder-pfs.supabase.co',
  isSupabaseConfigured ? rawSupabaseKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
