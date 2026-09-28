import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { readSupabasePublicEnv } from "./env";

export async function createSupabaseServerClient() {
  // Reading cookies first marks the calling route as dynamic, so Next.js never tries to
  // prerender a signed-in page at build time, where the Supabase env is absent.
  const cookieStore = await cookies();
  const { url, anonKey } = readSupabasePublicEnv();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. The session is refreshed where writes are
          // allowed (Route Handlers, Server Actions, proxy), so dropping the write here is safe.
        }
      },
    },
  });
}
