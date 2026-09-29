"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/credentials";
import { signUpAction } from "./actions";
import type { SignUpState } from "./signup-state";

const SIGN_UP_FAILURE_MESSAGES: Record<
  Exclude<SignUpState["status"], "idle" | "check_email">,
  string
> = {
  invalid_email: "Enter a valid email address.",
  weak_password: `Use a password of at least ${String(MIN_PASSWORD_LENGTH)} characters.`,
  email_taken: "This email already has an account. Sign in instead.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  failed: "We could not create your account. Try again.",
};

const INITIAL_STATE: SignUpState = { status: "idle" };

export function SignUpForm({ nextPath }: { nextPath: string | null }) {
  const [state, formAction] = useActionState(signUpAction, INITIAL_STATE);

  if (state.status === "check_email") {
    return (
      <p role="status" className="message-success">
        Check {state.email} to confirm your account, then sign in.
      </p>
    );
  }

  return (
    <form action={formAction} className="form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={MIN_PASSWORD_LENGTH}
        required
      />
      <p className="muted">At least {MIN_PASSWORD_LENGTH} characters.</p>
      {nextPath === null ? null : <input type="hidden" name="next" value={nextPath} readOnly />}
      {state.status === "idle" ? null : (
        <p role="alert" className="message-error">
          {SIGN_UP_FAILURE_MESSAGES[state.status]}
        </p>
      )}
      <SubmitButton label="Create account" pendingLabel="Creating…" />
    </form>
  );
}
