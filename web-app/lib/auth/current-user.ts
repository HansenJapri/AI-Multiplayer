import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export interface CurrentUser {
  id: string;
  email: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  // getUser revalidates the session with Supabase Auth instead of trusting the cookie alone.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user?.email === undefined) {
    return null;
  }
  return { id: user.id, email: user.email };
}
