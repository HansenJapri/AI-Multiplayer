import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { RunStoreError } from "./runs";

// Each call returns false when the database refuses the person (not an owner or driver of the
// run's workspace, or the run is already held / not held).

export async function queueSteerMessage(message: {
  runId: string;
  authorId: string;
  body: string;
}): Promise<boolean> {
  const { data: messageId, error } = await createSupabaseAdminClient().rpc("queue_steer_message", {
    p_run_id: message.runId,
    p_author_id: message.authorId,
    p_body: message.body,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return (messageId as string | null) !== null;
}

export async function holdRun(hold: {
  runId: string;
  userId: string;
  reason: string;
}): Promise<boolean> {
  const { data: held, error } = await createSupabaseAdminClient().rpc("raise_run_hold", {
    p_run_id: hold.runId,
    p_user_id: hold.userId,
    p_reason: hold.reason,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return held;
}

export async function releaseRun(release: { runId: string; userId: string }): Promise<boolean> {
  const { data: released, error } = await createSupabaseAdminClient().rpc("release_run_hold", {
    p_run_id: release.runId,
    p_user_id: release.userId,
  });
  if (error) {
    throw new RunStoreError(error.code);
  }
  return released;
}
