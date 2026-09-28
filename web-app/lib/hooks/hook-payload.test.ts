// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseHookPayload } from "./hook-payload";

const PRE_TOOL_USE_BODY = {
  session_id: "session-1",
  hook_event_name: "PreToolUse",
  cwd: "/home/dev/project",
  tool_name: "Bash",
  tool_input: { command: "npm test" },
};

describe("parseHookPayload", () => {
  it("reads the session id and hook name and keeps the full body for storage", () => {
    expect(parseHookPayload(PRE_TOOL_USE_BODY)).toEqual({
      claudeSessionId: "session-1",
      hookEventName: "PreToolUse",
      body: PRE_TOOL_USE_BODY,
    });
  });

  it.each(["SessionStart", "UserPromptSubmit", "PreToolUse", "PostToolUse", "Stop"])(
    "accepts the MVP hook %s",
    (hookEventName) => {
      expect(
        parseHookPayload({ session_id: "session-1", hook_event_name: hookEventName }),
      ).not.toBeNull();
    },
  );

  it("rejects a hook the MVP does not register", () => {
    expect(
      parseHookPayload({ session_id: "session-1", hook_event_name: "Notification" }),
    ).toBeNull();
  });

  it.each([null, "text", 42, ["session-1"]])(
    "rejects a body that is not a JSON object: %j",
    (body) => {
      expect(parseHookPayload(body)).toBeNull();
    },
  );

  it.each([undefined, "", "   ", 42])("rejects a missing or blank session id: %j", (sessionId) => {
    expect(parseHookPayload({ session_id: sessionId, hook_event_name: "Stop" })).toBeNull();
  });
});
