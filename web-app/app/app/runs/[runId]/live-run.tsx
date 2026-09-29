"use client";

import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { useActionState, useEffect, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { RunComment, RunForViewer, RunHold, SteerMessage } from "@/lib/runs/runs";
import {
  describeTimelineStep,
  mergeTimelineItems,
  type HookEventRow,
  type TimelineStep,
} from "@/lib/runs/timeline";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { postCommentAction } from "./actions";
import type { PostCommentState } from "./comment-state";
import { HoldBanner, SteeringPanel } from "./steering-panel";

const INITIAL_COMMENT_STATE: PostCommentState = { status: "idle" };
const UNKNOWN_AUTHOR = "teammate";

interface Viewer {
  id: string;
  email: string;
}

interface ChangedRow {
  new: Record<string, unknown>;
}

interface PresenceEntry {
  email: string;
}

function commentFromRow(
  row: Record<string, unknown>,
  knownEmails: Map<string, string>,
): RunComment {
  const authorId = String(row.author_id);
  return {
    id: String(row.id),
    stepId: typeof row.hook_event_id === "string" ? row.hook_event_id : null,
    authorId,
    authorEmail: knownEmails.get(authorId) ?? UNKNOWN_AUTHOR,
    body: String(row.body),
    receivedAt: String(row.created_at),
  };
}

function steerMessageFromRow(
  row: Record<string, unknown>,
  knownEmails: Map<string, string>,
): SteerMessage {
  const authorId = String(row.author_id);
  return {
    id: String(row.id),
    authorId,
    authorEmail: knownEmails.get(authorId) ?? UNKNOWN_AUTHOR,
    body: String(row.body),
    receivedAt: String(row.created_at),
    deliveredAt: typeof row.delivered_at === "string" ? row.delivered_at : null,
  };
}

// A released hold arrives as an update with released_at set.
function holdFromRow(
  row: Record<string, unknown>,
  knownEmails: Map<string, string>,
): RunHold | null {
  if (row.released_at !== null && row.released_at !== undefined) {
    return null;
  }
  return {
    raisedByEmail: knownEmails.get(String(row.raised_by)) ?? UNKNOWN_AUTHOR,
    reason: typeof row.reason === "string" ? row.reason : "",
  };
}

function knownEmailsFor(run: RunForViewer, viewer: Viewer): Map<string, string> {
  return new Map([
    ...run.comments.map((comment) => [comment.authorId, comment.authorEmail] as const),
    ...run.steerMessages.map((message) => [message.authorId, message.authorEmail] as const),
    [viewer.id, viewer.email] as const,
  ]);
}

function StepView({
  step,
  comments,
  onCommentOnStep,
}: {
  step: TimelineStep;
  comments: RunComment[];
  onCommentOnStep: (step: TimelineStep) => void;
}) {
  return (
    <li className={`step step-${step.kind}`}>
      <div className="step-header">
        <strong>{step.title}</strong>
        <span className="muted">{new Date(step.receivedAt).toLocaleTimeString()}</span>
      </div>
      {step.detail === undefined ? null : <pre className="code">{step.detail}</pre>}
      {step.diff === undefined || step.diff.length === 0 ? null : (
        <pre className="code diff">
          {step.diff.map((line, index) => (
            <span key={index} className={line.sign === "+" ? "diff-added" : "diff-removed"}>
              {line.text}
            </span>
          ))}
        </pre>
      )}
      {step.usage === undefined ? null : (
        <span className="badge">
          {step.usage.inputTokens} in · {step.usage.outputTokens} out tokens
        </span>
      )}
      {comments.map((comment) => (
        <CommentView key={comment.id} comment={comment} />
      ))}
      <button
        className="button button-quiet button-small"
        type="button"
        onClick={() => {
          onCommentOnStep(step);
        }}
      >
        Comment on this step
      </button>
    </li>
  );
}

function CommentView({ comment }: { comment: RunComment }) {
  return (
    <div className="comment">
      <span className="comment-author">{comment.authorEmail}</span>
      <p>{comment.body}</p>
    </div>
  );
}

export function LiveRun({ run, viewer }: { run: RunForViewer; viewer: Viewer }) {
  const [steps, setSteps] = useState(run.steps);
  const [comments, setComments] = useState(run.comments);
  const [steerMessages, setSteerMessages] = useState(run.steerMessages);
  const [hold, setHold] = useState(run.hold);
  const [watchers, setWatchers] = useState<string[]>([]);
  const [anchorStep, setAnchorStep] = useState<TimelineStep | null>(null);
  const [commentState, commentAction] = useActionState(postCommentAction, INITIAL_COMMENT_STATE);

  useEffect(() => {
    const knownEmails = knownEmailsFor(run, viewer);
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`run:${run.id}`, { config: { presence: { key: viewer.id } } });
    let leftBeforeSubscribing = false;

    async function subscribeAsViewer() {
      // Realtime otherwise joins as anon, and row level security then delivers no inserts.
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await supabase.realtime.setAuth(session?.access_token ?? null);
      if (leftBeforeSubscribing) {
        return;
      }
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "hook_events",
            filter: `run_id=eq.${run.id}`,
          },
          (payload: ChangedRow) => {
            setSteps((current) =>
              mergeTimelineItems(current, [
                describeTimelineStep(payload.new as unknown as HookEventRow),
              ]),
            );
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "run_comments",
            filter: `run_id=eq.${run.id}`,
          },
          (payload: ChangedRow) => {
            setComments((current) =>
              mergeTimelineItems(current, [commentFromRow(payload.new, knownEmails)]),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "steer_messages", filter: `run_id=eq.${run.id}` },
          (payload: ChangedRow) => {
            setSteerMessages((current) =>
              mergeTimelineItems(current, [steerMessageFromRow(payload.new, knownEmails)]),
            );
          },
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "run_holds", filter: `run_id=eq.${run.id}` },
          (payload: ChangedRow) => {
            setHold(holdFromRow(payload.new, knownEmails));
          },
        )
        .on("presence", { event: "sync" }, () => {
          const present = Object.values(channel.presenceState<PresenceEntry>()).flat();
          setWatchers([...new Set(present.map((entry) => entry.email))]);
        })
        .subscribe((status) => {
          if (status === REALTIME_SUBSCRIBE_STATES.SUBSCRIBED) {
            void channel.track({ email: viewer.email });
          }
        });
    }

    void subscribeAsViewer();
    return () => {
      leftBeforeSubscribing = true;
      void supabase.removeChannel(channel);
    };
  }, [run, viewer]);

  const runComments = comments.filter((comment) => comment.stepId === null);

  return (
    <>
      <HoldBanner hold={hold} />
      <section aria-label="Presence" className="presence">
        <span className="muted">Watching now:</span>
        <ul aria-label="Watching now" className="watchers">
          {watchers.map((email) => (
            <li key={email} className="badge">
              {email}
            </li>
          ))}
        </ul>
      </section>

      {run.viewerRole === "guest" ? null : (
        <SteeringPanel runId={run.id} hold={hold} steerMessages={steerMessages} />
      )}

      <h2>Timeline</h2>
      {steps.length === 0 ? (
        <p className="muted">No steps yet. They appear here as soon as the agent works.</p>
      ) : (
        <ol className="timeline">
          {steps.map((step) => (
            <StepView
              key={step.id}
              step={step}
              comments={comments.filter((comment) => comment.stepId === step.id)}
              onCommentOnStep={setAnchorStep}
            />
          ))}
        </ol>
      )}

      <h2>Comments on the run</h2>
      {runComments.map((comment) => (
        <CommentView key={comment.id} comment={comment} />
      ))}

      <form action={commentAction} className="form comment-form">
        <input type="hidden" name="runId" value={run.id} readOnly />
        <input type="hidden" name="stepId" value={anchorStep?.id ?? ""} readOnly />
        {anchorStep === null ? null : (
          <p className="muted">
            Commenting on: {anchorStep.title}{" "}
            <button
              className="button button-quiet button-small"
              type="button"
              onClick={() => {
                setAnchorStep(null);
              }}
            >
              Clear
            </button>
          </p>
        )}
        <label htmlFor="comment-body">Comment</label>
        <textarea id="comment-body" name="body" rows={3} maxLength={4000} required />
        {commentState.status === "empty" ? (
          <p role="alert" className="message-error">
            Write something first.
          </p>
        ) : null}
        {commentState.status === "refused" ? (
          <p role="alert" className="message-error">
            You cannot comment on this run.
          </p>
        ) : null}
        <SubmitButton label="Post comment" pendingLabel="Posting…" />
      </form>
    </>
  );
}
