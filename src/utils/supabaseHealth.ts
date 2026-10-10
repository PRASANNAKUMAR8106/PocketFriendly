import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface HealthCheckResult {
  isConfigured: boolean;
  connected: boolean;
  supabaseUrl: string;
  error?: string;
  checks: {
    categories: { status: 'ok' | 'error' | 'skipped'; count?: number; error?: string };
    products: { status: 'ok' | 'error' | 'skipped'; count?: number; error?: string };
    collections: { status: 'ok' | 'error' | 'skipped'; count?: number; error?: string };
    siteSettings: { status: 'ok' | 'error' | 'skipped'; exists?: boolean; error?: string };
    authService: { status: 'ok' | 'error' | 'skipped'; error?: string };
  };
}

export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    isConfigured: isSupabaseConfigured,
    connected: false,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    checks: {
      categories: { status: 'skipped' },
      products: { status: 'skipped' },
      collections: { status: 'skipped' },
      siteSettings: { status: 'skipped' },
      authService: { status: 'skipped' },
    },
  };

  if (!isSupabaseConfigured) {
    result.error = 'Supabase environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY) are either missing or contain placeholders.';
    return result;
  }

  try {
    // 1. Check Categories
    const catRes = await supabase.from('categories').select('id', { count: 'exact' }).limit(1);
    if (catRes.error) {
      result.checks.categories = { status: 'error', error: catRes.error.message };
    } else {
      result.checks.categories = { status: 'ok', count: catRes.count ?? 0 };
    }

    // 2. Check Products
    const prodRes = await supabase.from('products').select('id', { count: 'exact' }).limit(1);
    if (prodRes.error) {
      result.checks.products = { status: 'error', error: prodRes.error.message };
    } else {
      result.checks.products = { status: 'ok', count: prodRes.count ?? 0 };
    }

    // 3. Check Collections
    const colRes = await supabase.from('collections').select('id', { count: 'exact' }).limit(1);
    if (colRes.error) {
      result.checks.collections = { status: 'error', error: colRes.error.message };
    } else {
      result.checks.collections = { status: 'ok', count: colRes.count ?? 0 };
    }

    // 4. Check Site Settings
    const setRes = await supabase.from('site_settings').select('id').limit(1);
    if (setRes.error) {
      result.checks.siteSettings = { status: 'error', error: setRes.error.message };
    } else {
      result.checks.siteSettings = { status: 'ok', exists: (setRes.data?.length ?? 0) > 0 };
    }

    // 5. Check Auth Service
    const authRes = await supabase.auth.getSession();
    if (authRes.error) {
      result.checks.authService = { status: 'error', error: authRes.error.message };
    } else {
      result.checks.authService = { status: 'ok' };
    }

    // If at least public tables responded without connection failure, mark connected
    const anyTableSucceeded =
      result.checks.categories.status === 'ok' ||
      result.checks.products.status === 'ok' ||
      result.checks.authService.status === 'ok';

    result.connected = anyTableSucceeded;
    if (!result.connected) {
      result.error = catRes.error?.message || prodRes.error?.message || 'Unable to establish database connection.';
    }
  } catch (err: any) {
    result.connected = false;
    result.error = err.message || 'Network error attempting to contact Supabase.';
  }

  return result;
}
