import { createClient } from "@supabase/supabase-js";

/** Server-only Supabase client using the service role key. */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SECRET_KEY env variable.");
  }
  return createClient(url, key);
}
