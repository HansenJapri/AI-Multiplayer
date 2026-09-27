import { createBrowserClient } from "@supabase/ssr";
import { readSupabasePublicEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey } = readSupabasePublicEnv();
  return createBrowserClient(url, anonKey);
}
