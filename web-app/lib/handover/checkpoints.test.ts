// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CheckpointStoreError,
  checkpointObjectPaths,
  completeCheckpointUpload,
  prepareResume,
  RESUME_DOWNLOAD_LIFETIME_SECONDS,
  startCheckpointUpload,
} from "./checkpoints";

const { rpcMock, createSignedUploadUrlMock, createSignedUrlMock, fromBucketMock } = vi.hoisted(
  () => {
    const createSignedUploadUrl = vi.fn();
    const createSignedUrl = vi.fn();
    return {
      rpcMock: vi.fn(),
      createSignedUploadUrlMock: createSignedUploadUrl,
      createSignedUrlMock: createSignedUrl,
      fromBucketMock: vi.fn(() => ({ createSignedUploadUrl, createSignedUrl })),
    };
  },
);

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock, storage: { from: fromBucketMock } }),
}));

const TOKEN_HASH = "a".repeat(64);
const COMMIT_SHA = "b".repeat(40);
const CHECKPOINT = {
  checkpoint_id: "checkpoint-1",
  run_id: "run-1",
  workspace_id: "workspace-1",
  sequence: 3,
};

describe("checkpointObjectPaths", () => {
  it("keeps each checkpoint's files under its workspace, run and step", () => {
    expect(checkpointObjectPaths({ workspaceId: "w", runId: "r", sequence: 2 })).toEqual({
      bundle: "w/r/2/repo.bundle",
      transcript: "w/r/2/transcript.jsonl",
    });
  });
});

describe("startCheckpointUpload", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("creates the checkpoint and returns signed upload URLs for its two files", async () => {
    rpcMock.mockResolvedValueOnce({ data: CHECKPOINT, error: null });
    createSignedUploadUrlMock
      .mockResolvedValueOnce({ data: { signedUrl: "https://storage/bundle" }, error: null })
      .mockResolvedValueOnce({ data: { signedUrl: "https://storage/transcript" }, error: null });

    const upload = await startCheckpointUpload({
      tokenHash: TOKEN_HASH,
      claudeSessionId: "session-1",
      commitSha: COMMIT_SHA,
    });

    expect(rpcMock).toHaveBeenCalledWith("create_run_checkpoint", {
      p_token_hash: TOKEN_HASH,
      p_claude_session_id: "session-1",
      p_commit_sha: COMMIT_SHA,
    });
    expect(fromBucketMock).toHaveBeenCalledWith("checkpoints");
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith("workspace-1/run-1/3/repo.bundle");
    expect(createSignedUploadUrlMock).toHaveBeenCalledWith("workspace-1/run-1/3/transcript.jsonl");
    expect(upload).toEqual({
      checkpointId: "checkpoint-1",
      sequence: 3,
      bundleUploadUrl: "https://storage/bundle",
      transcriptUploadUrl: "https://storage/transcript",
    });
  });

  it("returns null for an unknown install token", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(
      await startCheckpointUpload({
        tokenHash: TOKEN_HASH,
        claudeSessionId: "s",
        commitSha: COMMIT_SHA,
      }),
    ).toBeNull();
    expect(createSignedUploadUrlMock).not.toHaveBeenCalled();
  });

  it("fails when storage cannot sign an upload", async () => {
    rpcMock.mockResolvedValueOnce({ data: CHECKPOINT, error: null });
    createSignedUploadUrlMock.mockResolvedValueOnce({ data: null, error: { message: "down" } });

    await expect(
      startCheckpointUpload({ tokenHash: TOKEN_HASH, claudeSessionId: "s", commitSha: COMMIT_SHA }),
    ).rejects.toThrow(CheckpointStoreError);
  });
});

describe("completeCheckpointUpload", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marks the upload complete for the creating install", async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });

    expect(await completeCheckpointUpload(TOKEN_HASH, "checkpoint-1")).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("complete_run_checkpoint", {
      p_token_hash: TOKEN_HASH,
      p_checkpoint_id: "checkpoint-1",
    });
  });
});

describe("prepareResume", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the checkpoint and short-lived download URLs for its files", async () => {
    rpcMock.mockResolvedValueOnce({
      data: { ...CHECKPOINT, commit_sha: COMMIT_SHA, claude_session_id: "session-1" },
      error: null,
    });
    createSignedUrlMock
      .mockResolvedValueOnce({ data: { signedUrl: "https://storage/get-bundle" }, error: null })
      .mockResolvedValueOnce({
        data: { signedUrl: "https://storage/get-transcript" },
        error: null,
      });

    const resume = await prepareResume({ tokenHash: TOKEN_HASH, runId: "run-1", step: null });

    expect(rpcMock).toHaveBeenCalledWith("resolve_checkpoint_for_resume", {
      p_token_hash: TOKEN_HASH,
      p_run_id: "run-1",
      p_sequence: null,
    });
    expect(createSignedUrlMock).toHaveBeenCalledWith(
      "workspace-1/run-1/3/repo.bundle",
      RESUME_DOWNLOAD_LIFETIME_SECONDS,
    );
    expect(resume).toEqual({
      runId: "run-1",
      sequence: 3,
      commitSha: COMMIT_SHA,
      claudeSessionId: "session-1",
      bundleUrl: "https://storage/get-bundle",
      transcriptUrl: "https://storage/get-transcript",
    });
  });

  it("returns null when the install may not resume the run or the step is not ready", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await prepareResume({ tokenHash: TOKEN_HASH, runId: "run-1", step: 9 })).toBeNull();
    expect(createSignedUrlMock).not.toHaveBeenCalled();
  });
});
