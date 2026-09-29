import { readAccountEmails } from "@/lib/accounts/account-email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { describeTimelineStep, type TimelineStep } from "./timeline";

export type RunViewerRole = "owner" | "driver" | "guest";

export interface RunSummary {
  id: string;
  claudeSessionId: string;
  createdAt: string;
}

export interface RunComment {
  id: string;
  stepId: string | null;
  authorId: string;
  authorEmail: string;
  body: string;
  receivedAt: string;
}

export interface SteerMessage {
  id: string;
  authorId: string;
  authorEmail: string;
  body: string;
  receivedAt: string;
  deliveredAt: string | null;
}

export interface RunHold {
  raisedByEmail: string;
  reason: string;
}

export interface RunCheckpoint {
  step: number;
  receivedAt: string;
  // False while the bundle and transcript are still uploading; only ready steps can be resumed.
  ready: boolean;
}

export interface RunForViewer {
  id: string;
  workspaceId: string;
  workspaceName: string;
  claudeSessionId: string;
  viewerRole: RunViewerRole;
  steps: TimelineStep[];
  comments: RunComment[];
  steerMessages: SteerMessage[];
  hold: RunHold | null;
  checkpoints: RunCheckpoint[];
}

// Carries only the Postgres error code: PostgREST details can quote row values.
export class RunStoreError extends Error {
  override readonly name = "RunStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Run storage failed (database error ${databaseErrorCode})`);
  }
}

export async function listRunsForWorkspace(workspaceId: string): Promise<RunSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data: runs, error } = await supabase
    .from("runs")
    .select("id, claude_session_id, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return runs.map((run) => ({
    id: run.id,
    claudeSessionId: run.claude_session_id,
    createdAt: run.created_at,
  }));
}

async function recordRunView(runId: string, userId: string): Promise<RunViewerRole | null> {
  const { data: role, error } = await createSupabaseAdminClient().rpc("record_run_view", {
    p_run_id: runId,
    p_user_id: userId,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return role as RunViewerRole | null;
}

// Records the view first: it both authorizes the viewer and logs participant_joined. The run,
// its steps and its comments are then read through the viewer's own session (row level security).
export async function loadRunForViewer(
  runId: string,
  userId: string,
): Promise<RunForViewer | null> {
  const viewerRole = await recordRunView(runId, userId);
  if (viewerRole === null) {
    return null;
  }
  const supabase = await createSupabaseServerClient();

  const { data: run, error: runError } = await supabase
    .from("runs")
    .select("id, workspace_id, claude_session_id, created_at, workspace:workspaces(name)")
    .eq("id", runId)
    .single();
  if (runError) {
    throw new RunStoreError(runError.code);
  }

  const { data: hookEvents, error: stepsError } = await supabase
    .from("hook_events")
    .select("id, hook_event_name, payload, received_at")
    .eq("run_id", runId)
    .order("received_at");
  if (stepsError) {
    throw new RunStoreError(stepsError.code);
  }

  const { data: comments, error: commentsError } = await supabase
    .from("run_comments")
    .select("id, hook_event_id, author_id, body, created_at")
    .eq("run_id", runId)
    .order("created_at");
  if (commentsError) {
    throw new RunStoreError(commentsError.code);
  }

  const { data: steerMessages, error: steerError } = await supabase
    .from("steer_messages")
    .select("id, author_id, body, created_at, delivered_at")
    .eq("run_id", runId)
    .order("created_at");
  if (steerError) {
    throw new RunStoreError(steerError.code);
  }

  const { data: activeHold, error: holdError } = await supabase
    .from("run_holds")
    .select("raised_by, reason")
    .eq("run_id", runId)
    .is("released_at", null)
    .maybeSingle();
  if (holdError) {
    throw new RunStoreError(holdError.code);
  }

  const { data: checkpoints, error: checkpointsError } = await supabase
    .from("run_checkpoints")
    .select("sequence, created_at, uploaded_at")
    .eq("run_id", runId)
    .order("sequence");
  if (checkpointsError) {
    throw new RunStoreError(checkpointsError.code);
  }

  const authorEmails = await readAccountEmails([
    ...comments.map((comment) => comment.author_id),
    ...steerMessages.map((message) => message.author_id),
    ...(activeHold === null ? [] : [activeHold.raised_by]),
  ]);
  return {
    id: run.id,
    workspaceId: run.workspace_id,
    workspaceName: run.workspace.name,
    claudeSessionId: run.claude_session_id,
    viewerRole,
    steps: hookEvents.map(describeTimelineStep),
    comments: comments.map((comment) => ({
      id: comment.id,
      stepId: comment.hook_event_id,
      authorId: comment.author_id,
      authorEmail: authorEmails.get(comment.author_id) ?? "",
      body: comment.body,
      receivedAt: comment.created_at,
    })),
    steerMessages: steerMessages.map((message) => ({
      id: message.id,
      authorId: message.author_id,
      authorEmail: authorEmails.get(message.author_id) ?? "",
      body: message.body,
      receivedAt: message.created_at,
      deliveredAt: message.delivered_at,
    })),
    hold:
      activeHold === null
        ? null
        : {
            raisedByEmail: authorEmails.get(activeHold.raised_by) ?? "",
            reason: activeHold.reason,
          },
    checkpoints: checkpoints.map((checkpoint) => ({
      step: checkpoint.sequence,
      receivedAt: checkpoint.created_at,
      ready: checkpoint.uploaded_at !== null,
    })),
  };
}

export async function postRunComment(comment: {
  runId: string;
  authorId: string;
  body: string;
  stepId: string | null;
}): Promise<boolean> {
  const { data: commentId, error } = await createSupabaseAdminClient().rpc("post_run_comment", {
    p_run_id: comment.runId,
    p_author_id: comment.authorId,
    p_body: comment.body,
    // The generated type marks the anchor as required; the function accepts null for no anchor.
    p_hook_event_id: comment.stepId as string,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return (commentId as string | null) !== null;
}
