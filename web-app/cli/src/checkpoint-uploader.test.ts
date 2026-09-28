// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { uploadCheckpoint, type CheckpointUploaderDependencies } from "./checkpoint-uploader.js";

function requestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }
  return input instanceof URL ? input.href : input.url;
}

const API_URL = "https://ai-multiplayer.vercel.app";
const COMMIT_SHA = "d".repeat(40);
const STOP_BODY = JSON.stringify({
  session_id: "session-1",
  hook_event_name: "Stop",
  cwd: "/work/client-app",
  transcript_path: "/home/dev/.claude/projects/x/session-1.jsonl",
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

function dependencies(overrides: Partial<CheckpointUploaderDependencies> = {}) {
  const fetchMock = vi.fn<typeof fetch>((input) => {
    const url = requestUrl(input);
    if (url.endsWith("/api/cli/checkpoints")) {
      return Promise.resolve(
        jsonResponse(201, {
          checkpoint_id: "checkpoint-1",
          step: 1,
          bundle_upload_url: "https://storage/bundle",
          transcript_upload_url: "https://storage/transcript",
        }),
      );
    }
    return Promise.resolve(jsonResponse(200, {}));
  });
  const deps: CheckpointUploaderDependencies = {
    readCredentials: () =>
      Promise.resolve({ apiUrl: API_URL, installToken: "install-token", workspaceId: "w" }),
    isGitRepository: () => Promise.resolve(true),
    createSnapshotBundle: vi.fn(() => Promise.resolve({ commitSha: COMMIT_SHA })),
    readFileBytes: (path) => Promise.resolve(new TextEncoder().encode(`contents of ${path}`)),
    temporaryBundlePath: () => "/tmp/aim-checkpoint.bundle",
    removeFile: vi.fn(() => Promise.resolve()),
    fetch: fetchMock,
    ...overrides,
  };
  return { deps, fetchMock };
}

describe("uploadCheckpoint", () => {
  it("snapshots the project, uploads the bundle and transcript, then marks the checkpoint complete", async () => {
    const { deps, fetchMock } = dependencies();

    expect(await uploadCheckpoint(STOP_BODY, deps)).toBe("uploaded");

    expect(deps.createSnapshotBundle).toHaveBeenCalledWith(
      "/work/client-app",
      "/tmp/aim-checkpoint.bundle",
    );
    const calls = fetchMock.mock.calls.map(([url, init]) => [requestUrl(url), init?.method]);
    expect(calls).toEqual([
      [`${API_URL}/api/cli/checkpoints`, "POST"],
      ["https://storage/bundle", "PUT"],
      ["https://storage/transcript", "PUT"],
      [`${API_URL}/api/cli/checkpoints/complete`, "POST"],
    ]);
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBe(
      JSON.stringify({ session_id: "session-1", commit_sha: COMMIT_SHA }),
    );
    expect(deps.removeFile).toHaveBeenCalledWith("/tmp/aim-checkpoint.bundle");
  });

  it("skips projects that are not git repositories", async () => {
    const { deps, fetchMock } = dependencies({ isGitRepository: () => Promise.resolve(false) });

    expect(await uploadCheckpoint(STOP_BODY, deps)).toBe("skipped");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("skips when the machine is not logged in", async () => {
    const { deps } = dependencies({ readCredentials: () => Promise.resolve(null) });

    expect(await uploadCheckpoint(STOP_BODY, deps)).toBe("skipped");
  });

  it("does not mark the checkpoint complete when an upload fails", async () => {
    const { deps, fetchMock } = dependencies();
    fetchMock.mockImplementation((input) =>
      Promise.resolve(
        requestUrl(input).endsWith("/api/cli/checkpoints")
          ? jsonResponse(201, {
              checkpoint_id: "checkpoint-1",
              step: 1,
              bundle_upload_url: "https://storage/bundle",
              transcript_upload_url: "https://storage/transcript",
            })
          : jsonResponse(500, {}),
      ),
    );

    expect(await uploadCheckpoint(STOP_BODY, deps)).toBe("failed");
    expect(fetchMock.mock.calls.some(([url]) => requestUrl(url).endsWith("/complete"))).toBe(false);
    expect(deps.removeFile).toHaveBeenCalled();
  });
});
