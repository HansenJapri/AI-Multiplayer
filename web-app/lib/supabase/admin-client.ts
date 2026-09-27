import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { readSupabaseUrl, requireEnvValue } from "./env";

// The service role bypasses row level security. Use it only for server work that has no user
// session (such as hook ingestion) and scope every query to a workspace yourself.
export function createSupabaseAdminClient() {
  const serviceRoleKey = requireEnvValue(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  return createClient<Database>(readSupabaseUrl(), serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
