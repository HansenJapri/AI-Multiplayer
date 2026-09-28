import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { readSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = readSupabasePublicEnv();
  return createBrowserClient<Database>(url, anonKey);
}
