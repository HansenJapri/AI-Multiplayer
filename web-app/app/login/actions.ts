"use server";

import { headers } from "next/headers";
import { parseEmailAddress } from "@/lib/auth/email";
import { buildAuthCallbackUrl } from "@/lib/auth/redirects";
import { originFromHeaders } from "@/lib/http/request-origin";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { LoginState } from "./login-state";

const HTTP_TOO_MANY_REQUESTS = 429;

function formText(formData: FormData, field: string): string | null {
  const value = formData.get(field);
  return typeof value === "string" ? value : null;
}

export async function sendMagicLink(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = parseEmailAddress(formText(formData, "email"));
  if (email === null) {
    return { status: "invalid_email" };
  }

  const origin = originFromHeaders(await headers());
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildAuthCallbackUrl(origin, formText(formData, "next")),
      shouldCreateUser: true,
    },
  });

  if (error === null) {
    return { status: "sent", email };
  }
  return error.status === HTTP_TOO_MANY_REQUESTS
    ? { status: "rate_limited" }
    : { status: "failed" };
}
