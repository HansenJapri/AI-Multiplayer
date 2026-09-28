// The five hooks the MVP needs (AGENTS.md section 3). All run one command, the aim hook script.
export const AIM_HOOK_EVENTS = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PostToolUse",
  "Stop",
] as const;

export const AIM_HOOK_SCRIPT_NAME = "aim-hook.mjs";

// Seconds. The script itself gives up on the server well before this.
const AIM_HOOK_TIMEOUT_SECONDS = 10;

export interface HookHandler {
  type: string;
  command?: string;
  timeout?: number;
  [setting: string]: unknown;
}

export interface HookMatcherGroup {
  matcher?: string;
  hooks: HookHandler[];
}

export interface ClaudeSettings {
  hooks?: Record<string, HookMatcherGroup[]>;
  [setting: string]: unknown;
}

function isAimHandler(handler: HookHandler): boolean {
  return handler.type === "command" && (handler.command ?? "").includes(AIM_HOOK_SCRIPT_NAME);
}

function isAimGroup(group: HookMatcherGroup): boolean {
  return group.hooks.some(isAimHandler);
}

export function hasAimHooks(settings: ClaudeSettings): boolean {
  return Object.values(settings.hooks ?? {}).some((groups) => groups.some(isAimGroup));
}

export function removeAimHooks(settings: ClaudeSettings): ClaudeSettings {
  const { hooks, ...otherSettings } = settings;
  const remainingHooks = Object.fromEntries(
    Object.entries(hooks ?? {})
      .map(([event, groups]) => [event, groups.filter((group) => !isAimGroup(group))] as const)
      .filter(([, groups]) => groups.length > 0),
  );
  return Object.keys(remainingHooks).length === 0
    ? otherSettings
    : { ...otherSettings, hooks: remainingHooks };
}

export function addAimHooks(settings: ClaudeSettings, hookCommand: string): ClaudeSettings {
  const withoutAim = removeAimHooks(settings);
  const hooks = { ...(withoutAim.hooks ?? {}) };
  for (const event of AIM_HOOK_EVENTS) {
    hooks[event] = [
      ...(hooks[event] ?? []),
      { hooks: [{ type: "command", command: hookCommand, timeout: AIM_HOOK_TIMEOUT_SECONDS }] },
    ];
  }
  return { ...withoutAim, hooks };
}
