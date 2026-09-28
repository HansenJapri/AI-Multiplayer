// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashOpaqueToken } from "@/lib/security/opaque-token";
import { POST as startCheckpoint } from "./route";
import { POST as completeCheckpoint } from "./complete/route";
import { POST as resume } from "../resume/route";

const { startCheckpointUploadMock, completeCheckpointUploadMock, prepareResumeMock } = vi.hoisted(
  () => ({
    startCheckpointUploadMock: vi.fn(),
    completeCheckpointUploadMock: vi.fn(),
    prepareResumeMock: vi.fn(),
  }),
);

vi.mock("@/lib/handover/checkpoints", () => ({
  startCheckpointUpload: startCheckpointUploadMock,
  completeCheckpointUpload: completeCheckpointUploadMock,
  prepareResume: prepareResumeMock,
}));

const TOKEN = "install-token";
const COMMIT_SHA = "c".repeat(40);

function cliRequest(path: string, body: unknown, token: string | null = TOKEN): NextRequest {
  const headers = new Headers({ "content-type": "application/json" });
  if (token !== null) {
    headers.set("authorization", `Bearer ${token}`);
  }
  return new NextRequest(`https://ai-multiplayer.vercel.app${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("POST /api/cli/checkpoints", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("starts a checkpoint and returns where to upload its files", async () => {
    startCheckpointUploadMock.mockResolvedValueOnce({
      checkpointId: "checkpoint-1",
      sequence: 2,
      bundleUploadUrl: "https://storage/b",
      transcriptUploadUrl: "https://storage/t",
    });

    const response = await startCheckpoint(
      cliRequest("/api/cli/checkpoints", { session_id: "s1", commit_sha: COMMIT_SHA }),
    );

    expect(startCheckpointUploadMock).toHaveBeenCalledWith({
      tokenHash: hashOpaqueToken(TOKEN),
      claudeSessionId: "s1",
      commitSha: COMMIT_SHA,
    });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      checkpoint_id: "checkpoint-1",
      step: 2,
      bundle_upload_url: "https://storage/b",
      transcript_upload_url: "https://storage/t",
    });
  });

  it("rejects a malformed commit hash or a missing session id", async () => {
    const badCommit = await startCheckpoint(
      cliRequest("/api/cli/checkpoints", { session_id: "s1", commit_sha: "HEAD" }),
    );
    const noSession = await startCheckpoint(
      cliRequest("/api/cli/checkpoints", { commit_sha: COMMIT_SHA }),
    );

    expect(badCommit.status).toBe(400);
    expect(noSession.status).toBe(400);
    expect(startCheckpointUploadMock).not.toHaveBeenCalled();
  });

  it("rejects a missing or unknown install token", async () => {
    startCheckpointUploadMock.mockResolvedValueOnce(null);

    const missing = await startCheckpoint(
      cliRequest("/api/cli/checkpoints", { session_id: "s1", commit_sha: COMMIT_SHA }, null),
    );
    const unknown = await startCheckpoint(
      cliRequest("/api/cli/checkpoints", { session_id: "s1", commit_sha: COMMIT_SHA }),
    );

    expect(missing.status).toBe(401);
    expect(unknown.status).toBe(401);
  });
});

describe("POST /api/cli/checkpoints/complete", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marks the upload complete", async () => {
    completeCheckpointUploadMock.mockResolvedValueOnce(true);

    const response = await completeCheckpoint(
      cliRequest("/api/cli/checkpoints/complete", { checkpoint_id: "checkpoint-1" }),
    );

    expect(completeCheckpointUploadMock).toHaveBeenCalledWith(
      hashOpaqueToken(TOKEN),
      "checkpoint-1",
    );
    expect(response.status).toBe(200);
  });

  it("answers 404 for a checkpoint this install did not create", async () => {
    completeCheckpointUploadMock.mockResolvedValueOnce(false);

    const response = await completeCheckpoint(
      cliRequest("/api/cli/checkpoints/complete", { checkpoint_id: "checkpoint-1" }),
    );

    expect(response.status).toBe(404);
  });
});

describe("POST /api/cli/resume", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns what the CLI needs to continue the run", async () => {
    prepareResumeMock.mockResolvedValueOnce({
      runId: "run-1",
      sequence: 3,
      commitSha: COMMIT_SHA,
      claudeSessionId: "session-1",
      bundleUrl: "https://storage/b",
      transcriptUrl: "https://storage/t",
    });

    const response = await resume(cliRequest("/api/cli/resume", { run_id: "run-1", step: 3 }));

    expect(prepareResumeMock).toHaveBeenCalledWith({
      tokenHash: hashOpaqueToken(TOKEN),
      runId: "run-1",
      step: 3,
    });
    expect(await response.json()).toEqual({
      run_id: "run-1",
      step: 3,
      commit_sha: COMMIT_SHA,
      claude_session_id: "session-1",
      bundle_url: "https://storage/b",
      transcript_url: "https://storage/t",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("resumes from the latest checkpoint when no step is given", async () => {
    prepareResumeMock.mockResolvedValueOnce(null);

    const response = await resume(cliRequest("/api/cli/resume", { run_id: "run-1" }));

    expect(prepareResumeMock).toHaveBeenCalledWith(expect.objectContaining({ step: null }));
    expect(response.status).toBe(404);
  });

  it("rejects a step that is not a positive whole number", async () => {
    const response = await resume(cliRequest("/api/cli/resume", { run_id: "run-1", step: 0 }));

    expect(response.status).toBe(400);
    expect(prepareResumeMock).not.toHaveBeenCalled();
  });
});
