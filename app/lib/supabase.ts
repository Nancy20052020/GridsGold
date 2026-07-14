import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase (PostgreSQL) client.
 *
 * Public credentials come from environment variables — NEVER hardcode them.
 * Set in `.env.local` (local) and Vercel → Project → Environment Variables (prod):
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=...          # legacy JWT anon key
 *   # or
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...  # new sb_publishable_… key
 *
 * Client bundles (Turbopack) do not always inline `process.env.NEXT_PUBLIC_*`,
 * so the root layout also passes these values into `initSupabase()` from the
 * server. When unset, the app falls back to local (mock) auth.
 */

export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

let client: SupabaseClient | null = null;
let configured = false;

function isPlaceholder(value: string): boolean {
  const v = value.toLowerCase();
  return (
    !v ||
    v.includes("your-project") ||
    v.includes("your-anon-key") ||
    v.includes("your_anon_key") ||
    v.includes("your-publishable") ||
    v.includes("your_publishable") ||
    v === "changeme"
  );
}

/** Prefer anon key, fall back to the newer publishable key name. */
export function readSupabasePublicKey(
  anonKey?: string | null,
  publishableKey?: string | null,
): string {
  const anon = (anonKey ?? "").trim();
  const publishable = (publishableKey ?? "").trim();
  return anon || publishable;
}

/** Validate and normalize public Supabase credentials. */
export function resolveSupabaseConfig(
  url?: string | null,
  anonKey?: string | null,
): SupabasePublicConfig | null {
  const resolvedUrl = (url ?? "").trim().replace(/\/+$/, "");
  const resolvedKey = (anonKey ?? "").trim();

  if (isPlaceholder(resolvedUrl) || isPlaceholder(resolvedKey)) return null;
  if (!/^https?:\/\//i.test(resolvedUrl)) return null;
  // Anon keys are JWTs (legacy) or sb_publishable_* (newer).
  if (resolvedKey.length < 20) return null;

  return { url: resolvedUrl, anonKey: resolvedKey };
}

/** Read config from process.env (works on the server / during SSR). */
export function readSupabaseEnv(): SupabasePublicConfig | null {
  return resolveSupabaseConfig(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    readSupabasePublicKey(
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  );
}

/**
 * Create (or reuse) the browser Supabase client.
 * Safe to call multiple times — only the first valid config wins.
 */
export function initSupabase(
  url?: string | null,
  anonKey?: string | null,
): SupabaseClient | null {
  if (configured && client) return client;

  const config =
    resolveSupabaseConfig(url, anonKey) ?? readSupabaseEnv();

  if (!config) {
    configured = false;
    client = null;
    return null;
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  configured = true;
  return client;
}

/** True once a valid Supabase client has been created. */
export function isSupabaseConfigured(): boolean {
  if (configured && client) return true;
  return initSupabase() !== null;
}

/** Shared Supabase client, or null when running in demo mode. */
export function getSupabase(): SupabaseClient | null {
  if (client) return client;
  return initSupabase();
}
