"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { signInAction } from "./actions";
import type { LoginState } from "./login-state";

const LOGIN_FAILURE_MESSAGES: Record<Exclude<LoginState["status"], "idle">, string> = {
  invalid_email: "Enter a valid email address.",
  invalid_credentials: "Wrong email or password.",
  rate_limited: "Too many attempts. Wait a few minutes and try again.",
  failed: "We could not sign you in. Try again.",
};

const INITIAL_STATE: LoginState = { status: "idle" };

export function LoginForm({ nextPath }: { nextPath: string | null }) {
  const [state, formAction] = useActionState(signInAction, INITIAL_STATE);

  return (
    <form action={formAction} className="form">
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {nextPath === null ? null : <input type="hidden" name="next" value={nextPath} readOnly />}
      {state.status === "idle" ? null : (
        <p role="alert" className="message-error">
          {LOGIN_FAILURE_MESSAGES[state.status]}
        </p>
      )}
      <SubmitButton label="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}
