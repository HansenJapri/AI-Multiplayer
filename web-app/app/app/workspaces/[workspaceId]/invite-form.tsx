"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { inviteTeammateAction } from "./actions";
import type { InviteTeammateState } from "./invite-form-state";

const INITIAL_STATE: InviteTeammateState = { status: "idle" };

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [state, formAction] = useActionState(inviteTeammateAction, INITIAL_STATE);
  return (
    <form action={formAction} className="form">
      <input type="hidden" name="workspaceId" value={workspaceId} readOnly />
      <label htmlFor="teammate-email">Teammate email</label>
      <input id="teammate-email" name="email" type="email" required />
      <SubmitButton label="Create invite link" pendingLabel="Creating…" />
      {state.status === "created" ? (
        <div role="status">
          <p className="message-success">
            Send this link to {state.email}. It works once, for that email, for 7 days.
          </p>
          <p className="code">{state.inviteUrl}</p>
        </div>
      ) : null}
      {state.status === "invalid_email" ? (
        <p role="alert" className="message-error">
          Enter a valid email address.
        </p>
      ) : null}
      {state.status === "not_owner" ? (
        <p role="alert" className="message-error">
          Only owners can invite teammates.
        </p>
      ) : null}
    </form>
  );
}
