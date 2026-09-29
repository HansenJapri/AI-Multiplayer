"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { RunGuest } from "@/lib/runs/runs";
import { inviteGuestAction } from "./guest-actions";
import type { GuestInviteState } from "./guest-invite-state";

const INITIAL_STATE: GuestInviteState = { status: "idle" };

// Members share this one run with a client. The client sees the timeline and the comments marked
// for them, and can comment back; nothing else in the workspace.
export function ClientAccessPanel({ runId, guests }: { runId: string; guests: RunGuest[] }) {
  const [state, formAction] = useActionState(inviteGuestAction, INITIAL_STATE);
  return (
    <section aria-label="Client access" className="card">
      <h2>Client access</h2>
      <p className="muted">
        A client sees this run&apos;s timeline and the comments you mark as visible to them, and can
        comment back. They never see your other runs, internal comments, or steering, and cannot
        steer, hold, or resume.
      </p>
      {guests.length === 0 ? (
        <p className="muted">No client can open this run yet.</p>
      ) : (
        <ul aria-label="Clients with access" className="watchers">
          {guests.map((guest) => (
            <li key={guest.userId} className="badge">
              {guest.email}
            </li>
          ))}
        </ul>
      )}
      <form action={formAction} className="form">
        <input type="hidden" name="runId" value={runId} readOnly />
        <label htmlFor="client-email">Client email</label>
        <input id="client-email" name="email" type="email" required />
        <SubmitButton label="Create guest link" pendingLabel="Creating…" />
        {state.status === "created" ? (
          <div role="status">
            <p className="message-success">
              Send this link to {state.email}. It opens this run only, works once, for that email,
              for 7 days.
            </p>
            <p className="code">{state.inviteUrl}</p>
          </div>
        ) : null}
        {state.status === "invalid_email" ? (
          <p role="alert" className="message-error">
            Enter a valid email address.
          </p>
        ) : null}
        {state.status === "refused" ? (
          <p role="alert" className="message-error">
            Only the run&apos;s team can invite a client.
          </p>
        ) : null}
      </form>
    </section>
  );
}
