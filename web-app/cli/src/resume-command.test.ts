// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import {
  claudeProjectDirectoryName,
  resumeCommand,
  type ResumeDependencies,
} from "./resume-command.js";

const API_URL = "https://ai-multiplayer.vercel.app";
const COMMIT_SHA = "e".repeat(40);
const RUN_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status });
}

function dependencies(overrides: Partial<ResumeDependencies> = {}) {
  const printed: string[] = [];
  const fetchMock = vi.fn<typeof fetch>(() =>
    Promise.resolve(
      jsonResponse(200, {
        run_id: RUN_ID,
        step: 2,
        commit_sha: COMMIT_SHA,
        claude_session_id: "session-1",
        bundle_url: "https://storage/get-bundle",
        transcript_url: "https://storage/get-transcript",
      }),
    ),
  );
  const deps: ResumeDependencies = {
    projectDirectory: "/work/client-app",
    readCredentials: () =>
      Promise.resolve({ apiUrl: API_URL, installToken: "install-token", workspaceId: "w" }),
    isGitRepository: () => Promise.resolve(true),
    isCleanWorkingTree: () => Promise.resolve(true),
    fetch: fetchMock,
    downloadToFile: vi.fn(() => Promise.resolve()),
    temporaryPath: (name) => `/tmp/${name}`,
    checkoutFromBundle: vi.fn(() => Promise.resolve()),
    installTranscript: vi.fn(() => Promise.resolve("/home/dev/.claude/projects/x/session-1.jsonl")),
    launchClaude: vi.fn(() => Promise.resolve(0)),
    print: (line) => printed.push(line),
    ...overrides,
  };
  return { deps, printed, fetchMock };
}

describe("claudeProjectDirectoryName", () => {
  it("encodes a project path the way Claude Code names its project folders", () => {
    expect(claudeProjectDirectoryName("D:\\My Project\\AI Multiplayer")).toBe(
      "D--My-Project-AI-Multiplayer",
    );
    expect(claudeProjectDirectoryName("/home/dev/client-app")).toBe("-home-dev-client-app");
  });
});

describe("resumeCommand", () => {
  it("checks out the checkpoint on a new branch, installs the transcript and continues in a fork", async () => {
    const { deps, fetchMock } = dependencies();

    expect(await resumeCommand({ runId: RUN_ID, step: 2, launch: true }, deps)).toBe(0);

    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/api/cli/resume`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ run_id: RUN_ID, step: 2 }),
      }),
    );
    expect(deps.downloadToFile).toHaveBeenCalledWith(
      "https://storage/get-bundle",
      "/tmp/aim-resume.bundle",
    );
    expect(deps.checkoutFromBundle).toHaveBeenCalledWith(
      "/work/client-app",
      "/tmp/aim-resume.bundle",
      {
        commitSha: COMMIT_SHA,
        branchName: "aim/resume/0f8fad5b-step-2",
      },
    );
    expect(deps.installTranscript).toHaveBeenCalledWith(
      "https://storage/get-transcript",
      "/work/client-app",
      "session-1",
    );
    expect(deps.launchClaude).toHaveBeenCalledWith("session-1");
  });

  it("prints the command instead of launching Claude Code when asked", async () => {
    const { deps, printed } = dependencies();

    expect(await resumeCommand({ runId: RUN_ID, step: null, launch: false }, deps)).toBe(0);

    expect(deps.launchClaude).not.toHaveBeenCalled();
    expect(printed.join("\n")).toContain("claude --resume session-1 --fork-session");
  });

  it("refuses a working tree with uncommitted changes before contacting the server", async () => {
    const { deps, fetchMock, printed } = dependencies({
      isCleanWorkingTree: () => Promise.resolve(false),
    });

    expect(await resumeCommand({ runId: RUN_ID, step: null, launch: true }, deps)).toBe(1);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(printed.join("\n")).toContain("uncommitted changes");
  });

  it("refuses outside a git repository", async () => {
    const { deps } = dependencies({ isGitRepository: () => Promise.resolve(false) });

    expect(await resumeCommand({ runId: RUN_ID, step: null, launch: true }, deps)).toBe(1);
  });

  it("explains when the run cannot be resumed", async () => {
    const { deps, printed } = dependencies({
      fetch: vi.fn<typeof fetch>(() => Promise.resolve(jsonResponse(404, { error: "not_found" }))),
    });

    expect(await resumeCommand({ runId: RUN_ID, step: 9, launch: true }, deps)).toBe(1);
    expect(printed.join("\n")).toContain("No checkpoint to resume");
    expect(deps.checkoutFromBundle).not.toHaveBeenCalled();
  });
});
