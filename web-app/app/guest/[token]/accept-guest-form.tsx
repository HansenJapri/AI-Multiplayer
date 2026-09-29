"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { AcceptGuestInviteState } from "./accept-guest-state";
import { acceptGuestInviteAction } from "./actions";

const INITIAL_STATE: AcceptGuestInviteState = { status: "idle" };

export function AcceptGuestForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptGuestInviteAction, INITIAL_STATE);
  return (
    <form action={formAction} className="form">
      <input type="hidden" name="token" value={token} readOnly />
      <SubmitButton label="Open the run" pendingLabel="Opening…" />
      {state.status === "invalid" ? (
        <p role="alert" className="message-error">
          This link cannot be used. It may have expired, been used already, or been sent to a
          different email address.
        </p>
      ) : null}
    </form>
  );
}
