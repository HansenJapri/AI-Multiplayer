// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { forwardHook, type HookForwarderDependencies } from "./hook-forwarder.js";

const CREDENTIALS = {
  apiUrl: "https://ai-multiplayer.vercel.app",
  installToken: "install-token",
  workspaceId: "workspace-1",
};

function dependencies(
  overrides: Partial<HookForwarderDependencies> = {},
): HookForwarderDependencies {
  return {
    readCredentials: () => Promise.resolve(CREDENTIALS),
    readTranscript: () => Promise.resolve(null),
    startCheckpoint: vi.fn(),
    fetch: vi.fn(() => Promise.resolve(new Response('{"hookSpecificOutput":{}}', { status: 200 }))),
    ...overrides,
  };
}

describe("forwardHook", () => {
  it("posts the hook body to the ingest endpoint with the install token and returns the reply", async () => {
    const deps = dependencies();
    const hookBody = JSON.stringify({ session_id: "s1", hook_event_name: "PreToolUse" });

    const output = await forwardHook(hookBody, deps);

    expect(output).toBe('{"hookSpecificOutput":{}}');
    expect(deps.fetch).toHaveBeenCalledWith(
      "https://ai-multiplayer.vercel.app/api/hooks/ingest",
      expect.objectContaining({
        method: "POST",
        headers: { Authorization: "Bearer install-token", "Content-Type": "application/json" },
        body: hookBody,
      }),
    );
  });

  it("adds the latest token usage from the transcript after a tool call and at the end of a turn", async () => {
    const fetchMock = vi.fn<typeof fetch>(() =>
      Promise.resolve(new Response("{}", { status: 200 })),
    );
    const deps = dependencies({
      fetch: fetchMock,
      readTranscript: () =>
        Promise.resolve(
          JSON.stringify({
            type: "assistant",
            message: { model: "claude-sonnet-5", usage: { input_tokens: 7, output_tokens: 8 } },
          }),
        ),
    });

    await forwardHook(
      JSON.stringify({ session_id: "s1", hook_event_name: "Stop", transcript_path: "/t.jsonl" }),
      deps,
    );

    const sentRequestBody = fetchMock.mock.calls[0]?.[1]?.body;
    if (typeof sentRequestBody !== "string") {
      throw new Error("expected a JSON string body");
    }
    const sentBody = JSON.parse(sentRequestBody) as { aim_usage: { output_tokens: number } };
    expect(sentBody.aim_usage.output_tokens).toBe(8);
  });

  it("starts a checkpoint in the background at the end of each turn", async () => {
    const deps = dependencies();
    const stopBody = JSON.stringify({ session_id: "s1", hook_event_name: "Stop" });

    await forwardHook(stopBody, deps);
    await forwardHook(JSON.stringify({ session_id: "s1", hook_event_name: "PreToolUse" }), deps);

    expect(deps.startCheckpoint).toHaveBeenCalledTimes(1);
    expect(deps.startCheckpoint).toHaveBeenCalledWith(stopBody);
  });

  it("stays silent when the machine is not logged in", async () => {
    const deps = dependencies({ readCredentials: () => Promise.resolve(null) });

    expect(await forwardHook("{}", deps)).toBe("");
    expect(deps.fetch).not.toHaveBeenCalled();
  });

  it("stays silent when the server refuses the hook, so Claude Code keeps working", async () => {
    const deps = dependencies({
      fetch: vi.fn(() =>
        Promise.resolve(new Response('{"error":"unauthorized"}', { status: 401 })),
      ),
    });

    expect(await forwardHook(JSON.stringify({ hook_event_name: "Stop" }), deps)).toBe("");
  });

  it("stays silent when the network fails", async () => {
    const deps = dependencies({ fetch: vi.fn(() => Promise.reject(new Error("offline"))) });

    expect(await forwardHook(JSON.stringify({ hook_event_name: "Stop" }), deps)).toBe("");
  });
});
