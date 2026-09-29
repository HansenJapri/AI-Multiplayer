import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

const CHECKPOINT_BUCKET = "checkpoints";
// Long enough to download a large bundle on a slow connection, short enough to be useless later.
export const RESUME_DOWNLOAD_LIFETIME_SECONDS = 600;

export interface CheckpointLocation {
  workspaceId: string;
  runId: string;
  sequence: number;
}

export interface CheckpointUpload {
  checkpointId: string;
  sequence: number;
  bundleUploadUrl: string;
  transcriptUploadUrl: string;
}

export interface ResumePlan {
  runId: string;
  sequence: number;
  commitSha: string;
  claudeSessionId: string;
  bundleUrl: string;
  transcriptUrl: string;
}

// Shapes of the jsonb returned by the checkpoint functions.
interface CreatedCheckpoint {
  checkpoint_id: string;
  run_id: string;
  workspace_id: string;
  sequence: number;
}

interface ResolvedCheckpoint extends CreatedCheckpoint {
  commit_sha: string;
  claude_session_id: string;
}

// Carries only a short cause: storage and PostgREST details can quote paths and row values.
export class CheckpointStoreError extends Error {
  override readonly name = "CheckpointStoreError";

  constructor(cause: string) {
    super(`Checkpoint storage failed (${cause})`);
  }
}

export function checkpointObjectPaths(location: CheckpointLocation): {
  bundle: string;
  transcript: string;
} {
  const folder = `${location.workspaceId}/${location.runId}/${String(location.sequence)}`;
  return { bundle: `${folder}/repo.bundle`, transcript: `${folder}/transcript.jsonl` };
}

function locationOf(checkpoint: CreatedCheckpoint): CheckpointLocation {
  return {
    workspaceId: checkpoint.workspace_id,
    runId: checkpoint.run_id,
    sequence: checkpoint.sequence,
  };
}

async function signedUploadUrl(path: string): Promise<string> {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(CHECKPOINT_BUCKET)
    .createSignedUploadUrl(path);
  if (error !== null) {
    throw new CheckpointStoreError("could not sign an upload");
  }
  return data.signedUrl;
}

async function signedDownloadUrl(path: string): Promise<string> {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(CHECKPOINT_BUCKET)
    .createSignedUrl(path, RESUME_DOWNLOAD_LIFETIME_SECONDS);
  if (error !== null) {
    throw new CheckpointStoreError("could not sign a download");
  }
  return data.signedUrl;
}

// Returns null when the install token is unknown or revoked.
export async function startCheckpointUpload(checkpoint: {
  tokenHash: string;
  claudeSessionId: string;
  commitSha: string;
}): Promise<CheckpointUpload | null> {
  const { data, error } = await createSupabaseAdminClient().rpc("create_run_checkpoint", {
    p_token_hash: checkpoint.tokenHash,
    p_claude_session_id: checkpoint.claudeSessionId,
    p_commit_sha: checkpoint.commitSha,
  });
  if (error) {
    throw new CheckpointStoreError(`database error ${error.code}`);
  }
  const created = data as CreatedCheckpoint | null;
  if (created === null) {
    return null;
  }
  const paths = checkpointObjectPaths(locationOf(created));
  return {
    checkpointId: created.checkpoint_id,
    sequence: created.sequence,
    bundleUploadUrl: await signedUploadUrl(paths.bundle),
    transcriptUploadUrl: await signedUploadUrl(paths.transcript),
  };
}

export async function completeCheckpointUpload(
  tokenHash: string,
  checkpointId: string,
): Promise<boolean> {
  const { data: completed, error } = await createSupabaseAdminClient().rpc(
    "complete_run_checkpoint",
    { p_token_hash: tokenHash, p_checkpoint_id: checkpointId },
  );
  if (error) {
    throw new CheckpointStoreError(`database error ${error.code}`);
  }
  return completed;
}

// Returns null when the install may not resume the run or the requested step is not ready.
export async function prepareResume(request: {
  tokenHash: string;
  runId: string;
  step: number | null;
}): Promise<ResumePlan | null> {
  const { data, error } = await createSupabaseAdminClient().rpc("resolve_checkpoint_for_resume", {
    p_token_hash: request.tokenHash,
    p_run_id: request.runId,
    // The generated type marks the step as required; the function treats null as "latest".
    p_sequence: request.step as number,
  });
  if (error) {
    throw new CheckpointStoreError(`database error ${error.code}`);
  }
  const resolved = data as ResolvedCheckpoint | null;
  if (resolved === null) {
    return null;
  }
  const paths = checkpointObjectPaths(locationOf(resolved));
  return {
    runId: resolved.run_id,
    sequence: resolved.sequence,
    commitSha: resolved.commit_sha,
    claudeSessionId: resolved.claude_session_id,
    bundleUrl: await signedDownloadUrl(paths.bundle),
    transcriptUrl: await signedDownloadUrl(paths.transcript),
  };
}
