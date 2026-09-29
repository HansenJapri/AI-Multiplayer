"use server";

import { redirect } from "next/navigation";
import { isRateLimited } from "@/lib/auth/auth-errors";
import { parseCredentials } from "@/lib/auth/credentials";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { readFormText } from "@/lib/http/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { LoginState } from "./login-state";

export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const credentials = parseCredentials(formData);
  if (!credentials.ok) {
    // A password that could never have been set is simply wrong; say nothing more about it.
    return credentials.reason === "invalid_email"
      ? { status: "invalid_email" }
      : { status: "invalid_credentials" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) {
    if (isRateLimited(error)) {
      return { status: "rate_limited" };
    }
    // Wrong password and unknown email share one answer, so the form cannot probe for accounts.
    return error.code === "invalid_credentials"
      ? { status: "invalid_credentials" }
      : { status: "failed" };
  }
  redirect(safeRedirectPath(readFormText(formData, "next")));
}
