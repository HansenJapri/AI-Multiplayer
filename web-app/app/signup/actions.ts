"use server";

import { redirect } from "next/navigation";
import { isRateLimited } from "@/lib/auth/auth-errors";
import { parseCredentials } from "@/lib/auth/credentials";
import { safeRedirectPath } from "@/lib/auth/redirects";
import { readFormText } from "@/lib/http/form-data";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { SignUpState } from "./signup-state";

const EMAIL_TAKEN_CODES = new Set(["user_already_exists", "email_exists"]);

export async function signUpAction(
  _previous: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const credentials = parseCredentials(formData);
  if (!credentials.ok) {
    return { status: credentials.reason };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });
  if (error) {
    if (isRateLimited(error)) {
      return { status: "rate_limited" };
    }
    if (error.code !== undefined && EMAIL_TAKEN_CODES.has(error.code)) {
      return { status: "email_taken" };
    }
    return error.code === "weak_password" ? { status: "weak_password" } : { status: "failed" };
  }
  // With email confirmation off (this project's setting) sign-up also signs the user in.
  if (data.session === null) {
    return { status: "check_email", email: credentials.email };
  }
  redirect(safeRedirectPath(readFormText(formData, "next")));
}
