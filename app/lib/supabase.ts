import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase (PostgreSQL) client.
 *
 * The URL + anon key come from environment variables — NEVER hardcode them in
 * source. Set them in `.env.local` for local dev and in Vercel → Project →
 * Settings → Environment Variables for production:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
 *
 * When the vars are absent the app falls back to local (mock) auth so it still
 * runs without a database.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
