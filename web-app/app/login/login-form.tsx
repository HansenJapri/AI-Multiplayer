"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { sendMagicLink } from "./actions";
import type { LoginState } from "./login-state";

const LOGIN_FAILURE_MESSAGES: Record<Exclude<LoginState["status"], "idle" | "sent">, string> = {
  invalid_email: "Enter a valid email address.",
  rate_limited: "Too many sign-in emails were sent. Wait a few minutes and try again.",
  failed: "We could not send the sign-in email. Try again.",
};

const INITIAL_STATE: LoginState = { status: "idle" };

export function LoginForm({ nextPath }: { nextPath: string | null }) {
  const [state, formAction] = useActionState(sendMagicLink, INITIAL_STATE);

  if (state.status === "sent") {
    return (
      <p role="status" className="message-success">
        Check {state.email} for a sign-in link.
      </p>
    );
  }

  return (
    <form action={formAction} className="form">
      <label htmlFor="email">Work email</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      {nextPath === null ? null : <input type="hidden" name="next" value={nextPath} readOnly />}
      {state.status === "idle" ? null : (
        <p role="alert" className="message-error">
          {LOGIN_FAILURE_MESSAGES[state.status]}
        </p>
      )}
      <SubmitButton label="Email me a sign-in link" pendingLabel="Sending…" />
    </form>
  );
}
