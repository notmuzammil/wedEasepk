import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

// createClient throws on an empty URL, which would blank the whole app.
// Fall back to a placeholder so the UI still renders, and short-circuit every
// request so data calls fail fast into the UI's error states instead of hanging.
// (A rejected fetch would be retried with backoff by postgrest-js, so answer
// with a non-retryable error response instead.)
const NOT_CONFIGURED_MESSAGE =
  'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env';

const notConfiguredFetch = () =>
  Promise.resolve(
    new Response(
      JSON.stringify({ message: NOT_CONFIGURED_MESSAGE, msg: NOT_CONFIGURED_MESSAGE, code: 'NOT_CONFIGURED' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  );

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  isSupabaseConfigured ? undefined : { global: { fetch: notConfiguredFetch } }
);
