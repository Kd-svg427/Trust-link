import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function initSupabase(url, key) {
  const finalUrl = url || import.meta.env.VITE_SUPABASE_URL;
  const finalKey = key || import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!finalUrl || !finalKey) throw new Error('Supabase URL and anon key are required');
  supabase = createClient(finalUrl, finalKey);
  return supabase;
}

export function getSupabase() {
  if (!supabase) throw new Error('Supabase not initialized — call initSupabase() first');
  return supabase;
}
