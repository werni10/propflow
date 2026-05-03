import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient> | null = null;
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function initSupabase() {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  supabase = createClient(url, key);
  return supabase;
}

function initSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables');
  }

  supabaseAdmin = createClient(url, key);
  return supabaseAdmin;
}

export function getSupabase() {
  return initSupabase();
}

export function getSupabaseAdmin() {
  return initSupabaseAdmin();
}
