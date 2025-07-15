import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// Optional holder to cache eaiSupabase client
let _eaiSupabase: SupabaseClient | null = null;

export function getEaiSupabase(): SupabaseClient | null {
  const isEnabled = config('external_api_enabled') === 'true'; // assuming config values are stored as string

  if (!isEnabled) {
    console.warn("EAI Supabase is disabled in config.");
    return null;
  }

  if (!_eaiSupabase) {
    const url = process.env.NEXT_PUBLIC_EAI_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_EAI_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error("Missing environment variables for EAI Supabase.");
    }

    _eaiSupabase = createClient(url, key);
  }

  return _eaiSupabase;
}
