import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service role key.
 *
 * Lazy singleton — created once per serverless instance and reused.
 */
let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY env variable.");
  }
  _client = createClient(url, key);
  return _client;
}
