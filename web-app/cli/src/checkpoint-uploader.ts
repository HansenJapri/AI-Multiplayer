import type { AimCredentials } from "./hook-forwarder.js";

export interface CheckpointUploaderDependencies {
  readCredentials: () => Promise<AimCredentials | null>;
  isGitRepository: (directory: string) => Promise<boolean>;
  createSnapshotBundle: (directory: string, bundlePath: string) => Promise<{ commitSha: string }>;
  readFileBytes: (path: string) => Promise<Uint8Array<ArrayBuffer>>;
  temporaryBundlePath: () => string;
  removeFile: (path: string) => Promise<void>;
  fetch: typeof fetch;
}

export type CheckpointUploadOutcome = "uploaded" | "skipped" | "failed";

interface StartedCheckpoint {
  checkpoint_id: string;
  bundle_upload_url: string;
  transcript_upload_url: string;
}

interface StopHookFields {
  sessionId: string;
  projectDirectory: string;
  transcriptPath: string;
}

function readStopHook(hookBody: string): StopHookFields | null {
  try {
    const body = JSON.parse(hookBody) as Record<string, unknown>;
    const { session_id: sessionId, cwd, transcript_path: transcriptPath } = body;
    return typeof sessionId === "string" &&
      typeof cwd === "string" &&
      typeof transcriptPath === "string"
      ? { sessionId, projectDirectory: cwd, transcriptPath }
      : null;
  } catch {
    return null;
  }
}

async function putFile(
  url: string,
  bytes: Uint8Array<ArrayBuffer>,
  deps: CheckpointUploaderDependencies,
) {
  const response = await deps.fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: bytes,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (HTTP ${String(response.status)})`);
  }
}

// Runs in a detached process after each agent turn, so a slow upload never holds up Claude Code.
// The checkpoint is marked complete only when both files are stored.
export async function uploadCheckpoint(
  hookBody: string,
  deps: CheckpointUploaderDependencies,
): Promise<CheckpointUploadOutcome> {
  const stopHook = readStopHook(hookBody);
  const credentials = await deps.readCredentials();
  if (
    stopHook === null ||
    credentials === null ||
    !(await deps.isGitRepository(stopHook.projectDirectory))
  ) {
    return "skipped";
  }

  const authorization = { Authorization: `Bearer ${credentials.installToken}` };
  const bundlePath = deps.temporaryBundlePath();
  try {
    const { commitSha } = await deps.createSnapshotBundle(stopHook.projectDirectory, bundlePath);
    const startResponse = await deps.fetch(`${credentials.apiUrl}/api/cli/checkpoints`, {
      method: "POST",
      headers: { ...authorization, "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: stopHook.sessionId, commit_sha: commitSha }),
    });
    if (!startResponse.ok) {
      return "failed";
    }
    const checkpoint = (await startResponse.json()) as StartedCheckpoint;
    await putFile(checkpoint.bundle_upload_url, await deps.readFileBytes(bundlePath), deps);
    await putFile(
      checkpoint.transcript_upload_url,
      await deps.readFileBytes(stopHook.transcriptPath),
      deps,
    );

    const completeResponse = await deps.fetch(
      `${credentials.apiUrl}/api/cli/checkpoints/complete`,
      {
        method: "POST",
        headers: { ...authorization, "Content-Type": "application/json" },
        body: JSON.stringify({ checkpoint_id: checkpoint.checkpoint_id }),
      },
    );
    return completeResponse.ok ? "uploaded" : "failed";
  } catch {
    return "failed";
  } finally {
    await deps.removeFile(bundlePath);
  }
}
