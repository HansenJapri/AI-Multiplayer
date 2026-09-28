import { addAimHooks, removeAimHooks, type ClaudeSettings } from "./claude-settings.js";

// Claude Code reads project-local settings from this file; keeping the hooks here makes sharing
// opt-in per project, so sessions in other (for example other clients') repos are never sent.
export const LOCAL_SETTINGS_RELATIVE_PATH = ".claude/settings.local.json";

export interface InstallDependencies {
  projectDirectory: string;
  isLoggedIn: () => Promise<boolean>;
  installHookRuntime: () => Promise<string>;
  readSettings: (path: string) => Promise<ClaudeSettings | null>;
  writeSettings: (path: string, settings: ClaudeSettings) => Promise<void>;
  excludeFromGit: (projectDirectory: string, relativePath: string) => Promise<void>;
  print: (line: string) => void;
}

function localSettingsPath(projectDirectory: string): string {
  return `${projectDirectory}/${LOCAL_SETTINGS_RELATIVE_PATH}`;
}

export async function installCommand(deps: InstallDependencies): Promise<number> {
  if (!(await deps.isLoggedIn())) {
    deps.print("This machine is not connected yet. Run `aim login` first.");
    return 1;
  }
  const hookCommand = await deps.installHookRuntime();
  const settingsPath = localSettingsPath(deps.projectDirectory);
  const settings = (await deps.readSettings(settingsPath)) ?? {};
  await deps.writeSettings(settingsPath, addAimHooks(settings, hookCommand));
  await deps.excludeFromGit(deps.projectDirectory, LOCAL_SETTINGS_RELATIVE_PATH);
  deps.print(
    `Claude Code sessions in ${deps.projectDirectory} are now shared with your workspace.`,
  );
  deps.print("Start a new Claude Code session here to see it in the web timeline.");
  return 0;
}

export async function uninstallCommand(deps: InstallDependencies): Promise<number> {
  const settingsPath = localSettingsPath(deps.projectDirectory);
  const settings = await deps.readSettings(settingsPath);
  if (settings !== null) {
    await deps.writeSettings(settingsPath, removeAimHooks(settings));
  }
  deps.print(`Sessions in ${deps.projectDirectory} are no longer shared.`);
  return 0;
}
