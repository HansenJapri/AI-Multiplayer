// @vitest-environment node
import { describe, expect, it } from "vitest";
import { describeTimelineStep, mergeTimelineItems, type HookEventRow } from "./timeline";

function hookEvent(hookEventName: string, payload: Record<string, unknown>): HookEventRow {
  return {
    id: `event-${hookEventName}`,
    hook_event_name: hookEventName,
    payload,
    received_at: "2026-09-28T10:00:00.000Z",
  };
}

describe("describeTimelineStep", () => {
  it("shows the start of a session", () => {
    expect(describeTimelineStep(hookEvent("SessionStart", { source: "startup" }))).toMatchObject({
      kind: "session",
      title: "Session started",
      detail: "startup",
    });
  });

  it("shows the prompt a person gave the agent", () => {
    expect(
      describeTimelineStep(hookEvent("UserPromptSubmit", { prompt: "Fix the failing test" })),
    ).toMatchObject({ kind: "prompt", title: "Prompt", detail: "Fix the failing test" });
  });

  it("shows the shell command of a Bash tool call", () => {
    expect(
      describeTimelineStep(
        hookEvent("PreToolUse", { tool_name: "Bash", tool_input: { command: "npm test" } }),
      ),
    ).toMatchObject({ kind: "tool_call", title: "Bash", detail: "npm test" });
  });

  it("shows the file of a file tool call", () => {
    expect(
      describeTimelineStep(
        hookEvent("PreToolUse", { tool_name: "Read", tool_input: { file_path: "src/app.ts" } }),
      ),
    ).toMatchObject({ kind: "tool_call", title: "Read", detail: "src/app.ts" });
  });

  it("shows an edit as a diff with its token usage", () => {
    const step = describeTimelineStep(
      hookEvent("PostToolUse", {
        tool_name: "Edit",
        tool_input: { file_path: "src/app.ts", old_string: "a\nb", new_string: "a\nc" },
        aim_usage: { model: "claude-sonnet-5", input_tokens: 10, output_tokens: 20 },
      }),
    );

    expect(step).toMatchObject({ kind: "tool_result", title: "Edit done", detail: "src/app.ts" });
    expect(step.diff).toEqual([
      { sign: "-", text: "a" },
      { sign: "-", text: "b" },
      { sign: "+", text: "a" },
      { sign: "+", text: "c" },
    ]);
    expect(step.usage).toEqual({ model: "claude-sonnet-5", inputTokens: 10, outputTokens: 20 });
  });

  it("shows a written file as added lines", () => {
    const step = describeTimelineStep(
      hookEvent("PostToolUse", {
        tool_name: "Write",
        tool_input: { file_path: "notes.md", content: "hello\nworld" },
      }),
    );

    expect(step.diff).toEqual([
      { sign: "+", text: "hello" },
      { sign: "+", text: "world" },
    ]);
  });

  it("shows the end of a turn", () => {
    expect(describeTimelineStep(hookEvent("Stop", {}))).toMatchObject({
      kind: "stop",
      title: "Agent finished its turn",
    });
  });

  it("shortens very long details", () => {
    const step = describeTimelineStep(hookEvent("UserPromptSubmit", { prompt: "x".repeat(5000) }));

    expect(step.detail?.length).toBeLessThanOrEqual(2001);
    expect(step.detail?.endsWith("…")).toBe(true);
  });

  it("copes with payloads that are missing fields", () => {
    expect(describeTimelineStep(hookEvent("PreToolUse", {}))).toMatchObject({
      kind: "tool_call",
      title: "Tool call",
    });
  });
});

describe("mergeTimelineItems", () => {
  it("adds new items once and keeps them in time order", () => {
    const first = { id: "1", receivedAt: "2026-09-28T10:00:00Z" };
    const second = { id: "2", receivedAt: "2026-09-28T10:00:05Z" };
    const third = { id: "3", receivedAt: "2026-09-28T10:00:03Z" };

    expect(mergeTimelineItems([first, second], [second, third])).toEqual([first, third, second]);
  });
});
