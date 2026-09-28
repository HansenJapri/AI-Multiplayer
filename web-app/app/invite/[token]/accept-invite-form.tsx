"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { acceptInviteAction } from "./actions";
import type { AcceptInviteState } from "./accept-invite-state";

const INITIAL_STATE: AcceptInviteState = { status: "idle" };

export function AcceptInviteForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptInviteAction, INITIAL_STATE);
  return (
    <form action={formAction} className="form">
      <input type="hidden" name="token" value={token} readOnly />
      <SubmitButton label="Join workspace" pendingLabel="Joining…" />
      {state.status === "invalid" ? (
        <p role="alert" className="message-error">
          This invite cannot be used. It may have expired, been used already, or been sent to a
          different email address.
        </p>
      ) : null}
    </form>
  );
}
