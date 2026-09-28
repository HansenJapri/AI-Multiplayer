// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildHookOutput, EMPTY_DIRECTIVE } from "./hook-output";

describe("buildHookOutput", () => {
  it("lets the agent continue when there is nothing to deliver", () => {
    expect(buildHookOutput("PostToolUse", EMPTY_DIRECTIVE)).toEqual({});
  });

  it("refuses the tool call of a held run and tells the agent who paused it and why", () => {
    expect(
      buildHookOutput("PreToolUse", {
        hold: { raisedByEmail: "owner@agency.test", reason: "Reviewing the plan" },
        steerMessages: [],
      }),
    ).toEqual({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "paused by owner@agency.test: Reviewing the plan",
      },
    });
  });

  it("says only who paused the run when no reason was given", () => {
    const output = buildHookOutput("PreToolUse", {
      hold: { raisedByEmail: "owner@agency.test", reason: "" },
      steerMessages: [],
    });

    expect(output.hookSpecificOutput?.permissionDecisionReason).toBe("paused by owner@agency.test");
  });

  it("passes teammates' messages to the agent word for word, naming each author", () => {
    expect(
      buildHookOutput("PostToolUse", {
        hold: null,
        steerMessages: [
          { authorEmail: "driver@agency.test", body: "Use the existing helper" },
          { authorEmail: "owner@agency.test", body: "And add a test" },
        ],
      }),
    ).toEqual({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          "Message from teammate driver@agency.test: Use the existing helper\n\n" +
          "Message from teammate owner@agency.test: And add a test",
      },
    });
  });
});
