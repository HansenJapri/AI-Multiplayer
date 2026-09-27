// Mirrors the CHECK constraint on hook_events.hook_event_name; the database stays the final guard.
const MVP_HOOK_EVENT_NAMES = [
  "SessionStart",
  "UserPromptSubmit",
  "PreToolUse",
  "PostToolUse",
  "Stop",
] as const;

export type MvpHookEventName = (typeof MVP_HOOK_EVENT_NAMES)[number];

export interface HookPayload {
  claudeSessionId: string;
  hookEventName: MvpHookEventName;
  body: Record<string, unknown>;
}

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMvpHookEventName(value: unknown): value is MvpHookEventName {
  return MVP_HOOK_EVENT_NAMES.some((hookEventName) => hookEventName === value);
}

export function parseHookPayload(body: unknown): HookPayload | null {
  if (!isJsonObject(body)) {
    return null;
  }
  const { session_id: claudeSessionId, hook_event_name: hookEventName } = body;
  if (typeof claudeSessionId !== "string" || claudeSessionId.trim() === "") {
    return null;
  }
  if (!isMvpHookEventName(hookEventName)) {
    return null;
  }
  return { claudeSessionId, hookEventName, body };
}
