// @vitest-environment node
import { describe, expect, it } from "vitest";
import { AIM_HOOK_EVENTS, addAimHooks, hasAimHooks, removeAimHooks } from "./claude-settings.js";

const HOOK_COMMAND = 'node "/home/dev/.aim/aim-hook.mjs"';

describe("addAimHooks", () => {
  it("registers the hook command for every MVP hook event", () => {
    const settings = addAimHooks({}, HOOK_COMMAND);

    expect(Object.keys(settings.hooks ?? {})).toEqual([...AIM_HOOK_EVENTS]);
    expect(settings.hooks?.PreToolUse).toEqual([
      { hooks: [{ type: "command", command: HOOK_COMMAND, timeout: 10 }] },
    ]);
  });

  it("keeps the user's other settings and hooks", () => {
    const settings = addAimHooks(
      {
        permissions: { allow: ["Bash(npm test)"] },
        hooks: {
          PreToolUse: [{ matcher: "Bash", hooks: [{ type: "command", command: "lint.sh" }] }],
        },
      },
      HOOK_COMMAND,
    );

    expect(settings.permissions).toEqual({ allow: ["Bash(npm test)"] });
    expect(settings.hooks?.PreToolUse).toHaveLength(2);
    expect(settings.hooks?.PreToolUse?.[0]).toEqual({
      matcher: "Bash",
      hooks: [{ type: "command", command: "lint.sh" }],
    });
  });

  it("does not register the hooks twice", () => {
    const settings = addAimHooks(addAimHooks({}, HOOK_COMMAND), HOOK_COMMAND);

    expect(settings.hooks?.Stop).toHaveLength(1);
  });
});

describe("removeAimHooks", () => {
  it("removes only the aim hooks and drops events left empty", () => {
    const withBoth = addAimHooks(
      { hooks: { Stop: [{ hooks: [{ type: "command", command: "notify.sh" }] }] } },
      HOOK_COMMAND,
    );

    const settings = removeAimHooks(withBoth);

    expect(settings.hooks).toEqual({
      Stop: [{ hooks: [{ type: "command", command: "notify.sh" }] }],
    });
    expect(hasAimHooks(settings)).toBe(false);
  });

  it("removes the hooks key when nothing else is left", () => {
    expect(removeAimHooks(addAimHooks({ model: "sonnet" }, HOOK_COMMAND))).toEqual({
      model: "sonnet",
    });
  });
});

describe("hasAimHooks", () => {
  it("detects installed aim hooks", () => {
    expect(hasAimHooks(addAimHooks({}, HOOK_COMMAND))).toBe(true);
    expect(hasAimHooks({})).toBe(false);
  });
});
