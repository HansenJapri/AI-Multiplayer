// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { ClaudeSettings } from "./claude-settings.js";
import { installCommand, uninstallCommand, type InstallDependencies } from "./install-command.js";

const PROJECT_DIRECTORY = "/work/client-app";
const SETTINGS_PATH = "/work/client-app/.claude/settings.local.json";
const HOOK_COMMAND = 'node "/home/dev/.aim/runtime/aim-hook.mjs"';

function dependencies(existingSettings: ClaudeSettings | null, loggedIn = true) {
  const files = new Map<string, ClaudeSettings>();
  if (existingSettings !== null) {
    files.set(SETTINGS_PATH, existingSettings);
  }
  const printed: string[] = [];
  const deps: InstallDependencies = {
    projectDirectory: PROJECT_DIRECTORY,
    isLoggedIn: () => Promise.resolve(loggedIn),
    installHookRuntime: vi.fn(() => Promise.resolve(HOOK_COMMAND)),
    readSettings: (path) => Promise.resolve(files.get(path) ?? null),
    writeSettings: (path, settings) => {
      files.set(path, settings);
      return Promise.resolve();
    },
    excludeFromGit: vi.fn(() => Promise.resolve()),
    print: (line) => printed.push(line),
  };
  return { deps, files, printed };
}

describe("installCommand", () => {
  it("adds the aim hooks to this project's local Claude settings and keeps them out of git", async () => {
    const { deps, files } = dependencies({ model: "sonnet" });

    expect(await installCommand(deps)).toBe(0);

    const settings = files.get(SETTINGS_PATH);
    expect(settings?.model).toBe("sonnet");
    expect(settings?.hooks?.SessionStart?.[0]?.hooks[0]?.command).toBe(HOOK_COMMAND);
    expect(deps.excludeFromGit).toHaveBeenCalledWith(
      PROJECT_DIRECTORY,
      ".claude/settings.local.json",
    );
  });

  it("creates the settings file when the project has none", async () => {
    const { deps, files } = dependencies(null);

    await installCommand(deps);

    expect(files.get(SETTINGS_PATH)?.hooks?.Stop).toHaveLength(1);
  });

  it("refuses to install before aim login", async () => {
    const { deps, files, printed } = dependencies(null, false);

    expect(await installCommand(deps)).toBe(1);
    expect(files.size).toBe(0);
    expect(printed.join("\n")).toContain("aim login");
  });
});

describe("uninstallCommand", () => {
  it("removes only the aim hooks from this project", async () => {
    const { deps, files } = dependencies({
      hooks: {
        Stop: [
          { hooks: [{ type: "command", command: "notify.sh" }] },
          { hooks: [{ type: "command", command: HOOK_COMMAND }] },
        ],
      },
    });

    expect(await uninstallCommand(deps)).toBe(0);
    expect(files.get(SETTINGS_PATH)).toEqual({
      hooks: { Stop: [{ hooks: [{ type: "command", command: "notify.sh" }] }] },
    });
  });
});
