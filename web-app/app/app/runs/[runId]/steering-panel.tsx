"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { RunHold, SteerMessage } from "@/lib/runs/runs";
import { holdRunAction, releaseRunAction, sendSteerMessageAction } from "./steer-actions";
import type { SteerActionState } from "./steer-state";

const INITIAL_STATE: SteerActionState = { status: "idle" };

export function HoldBanner({ hold }: { hold: RunHold | null }) {
  if (hold === null) {
    return null;
  }
  return (
    <p role="status" aria-label="Run held" className="hold-banner">
      Held by {hold.raisedByEmail}
      {hold.reason === "" ? "" : `: ${hold.reason}`}. The agent&apos;s next tool call is refused
      until someone releases the run.
    </p>
  );
}

function HoldControls({ runId, hold }: { runId: string; hold: RunHold | null }) {
  const [holdState, holdAction] = useActionState(holdRunAction, INITIAL_STATE);
  const [releaseState, releaseAction] = useActionState(releaseRunAction, INITIAL_STATE);

  if (hold !== null) {
    return (
      <form action={releaseAction} className="form">
        <input type="hidden" name="runId" value={runId} readOnly />
        <SubmitButton label="Release the run" pendingLabel="Releasing…" />
        {releaseState.status === "refused" ? (
          <p role="alert" className="message-error">
            The run is not held any more.
          </p>
        ) : null}
      </form>
    );
  }
  return (
    <form action={holdAction} className="form">
      <input type="hidden" name="runId" value={runId} readOnly />
      <label htmlFor="hold-reason">Reason (optional)</label>
      <input id="hold-reason" name="reason" type="text" maxLength={500} />
      <SubmitButton label="Hold the run" pendingLabel="Holding…" />
      {holdState.status === "refused" ? (
        <p role="alert" className="message-error">
          Someone already holds this run.
        </p>
      ) : null}
    </form>
  );
}

function SteerForm({ runId }: { runId: string }) {
  const [state, action] = useActionState(sendSteerMessageAction, INITIAL_STATE);
  return (
    <form action={action} className="form">
      <input type="hidden" name="runId" value={runId} readOnly />
      <label htmlFor="steer-body">Message to the agent</label>
      <textarea id="steer-body" name="body" rows={2} maxLength={4000} required />
      <p className="muted">
        Sent word for word, with your email, right after the agent&apos;s next tool call.
      </p>
      {state.status === "empty" ? (
        <p role="alert" className="message-error">
          Write something first.
        </p>
      ) : null}
      {state.status === "refused" ? (
        <p role="alert" className="message-error">
          You cannot steer this run.
        </p>
      ) : null}
      <SubmitButton label="Send to the agent" pendingLabel="Sending…" />
    </form>
  );
}

export function SteeringPanel({
  runId,
  hold,
  steerMessages,
}: {
  runId: string;
  hold: RunHold | null;
  steerMessages: SteerMessage[];
}) {
  return (
    <section aria-label="Steer the run" className="card steering">
      <h2>Steer</h2>
      {steerMessages.length === 0 ? null : (
        <ul className="list">
          {steerMessages.map((message) => (
            <li key={message.id} className="list-item">
              <span>
                <span className="comment-author">{message.authorEmail}</span>
                <br />
                {message.body}
              </span>
              <span className="badge">{message.deliveredAt === null ? "queued" : "delivered"}</span>
            </li>
          ))}
        </ul>
      )}
      <SteerForm runId={runId} />
      <HoldControls runId={runId} hold={hold} />
    </section>
  );
}
