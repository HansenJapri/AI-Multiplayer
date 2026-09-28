// Turns stored Claude Code hook payloads into readable timeline steps. Purely descriptive: the app
// shows what the agent did and never grades it.

const MAX_DETAIL_LENGTH = 2000;
const ELLIPSIS = "…";
const FILE_TOOLS_WITH_PATH = ["Read", "Edit", "MultiEdit", "Write", "NotebookEdit"];

export interface HookEventRow {
  id: string;
  hook_event_name: string;
  payload: unknown;
  received_at: string;
}

export type TimelineStepKind = "session" | "prompt" | "tool_call" | "tool_result" | "stop";

export interface DiffLine {
  sign: "+" | "-";
  text: string;
}

export interface StepUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export interface TimelineStep {
  id: string;
  receivedAt: string;
  kind: TimelineStepKind;
  title: string;
  detail?: string;
  diff?: DiffLine[];
  usage?: StepUsage;
}

type Payload = Record<string, unknown>;

function asRecord(value: unknown): Payload {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Payload)
    : {};
}

function text(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function shorten(value: string | undefined): string | undefined {
  if (value === undefined || value.length <= MAX_DETAIL_LENGTH) {
    return value;
  }
  return `${value.slice(0, MAX_DETAIL_LENGTH)}${ELLIPSIS}`;
}

function toolDetail(toolName: string | undefined, toolInput: Payload): string | undefined {
  if (toolName === "Bash") {
    return text(toolInput.command);
  }
  if (toolName !== undefined && FILE_TOOLS_WITH_PATH.includes(toolName)) {
    return text(toolInput.file_path) ?? text(toolInput.notebook_path);
  }
  return text(toolInput.pattern) ?? text(toolInput.url) ?? text(toolInput.description);
}

function lines(sign: DiffLine["sign"], value: unknown): DiffLine[] {
  const content = text(value);
  return content === undefined ? [] : content.split("\n").map((line) => ({ sign, text: line }));
}

function toolDiff(toolName: string | undefined, toolInput: Payload): DiffLine[] | undefined {
  if (toolName === "Edit") {
    return [...lines("-", toolInput.old_string), ...lines("+", toolInput.new_string)];
  }
  if (toolName === "Write") {
    return lines("+", toolInput.content);
  }
  return undefined;
}

function usage(payload: Payload): StepUsage | undefined {
  const reported = asRecord(payload.aim_usage);
  const { input_tokens: inputTokens, output_tokens: outputTokens } = reported;
  if (typeof inputTokens !== "number" || typeof outputTokens !== "number") {
    return undefined;
  }
  return { model: text(reported.model) ?? "unknown", inputTokens, outputTokens };
}

function describeByHook(
  hookEventName: string,
  payload: Payload,
): Omit<TimelineStep, "id" | "receivedAt"> {
  const toolName = text(payload.tool_name);
  const toolInput = asRecord(payload.tool_input);
  switch (hookEventName) {
    case "SessionStart":
      return { kind: "session", title: "Session started", detail: text(payload.source) };
    case "UserPromptSubmit":
      return { kind: "prompt", title: "Prompt", detail: shorten(text(payload.prompt)) };
    case "PreToolUse":
      return {
        kind: "tool_call",
        title: toolName ?? "Tool call",
        detail: shorten(toolDetail(toolName, toolInput)),
      };
    case "PostToolUse":
      return {
        kind: "tool_result",
        title: `${toolName ?? "Tool"} done`,
        detail: shorten(toolDetail(toolName, toolInput)),
        diff: toolDiff(toolName, toolInput),
        usage: usage(payload),
      };
    default:
      return { kind: "stop", title: "Agent finished its turn", usage: usage(payload) };
  }
}

function withoutUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined),
  ) as T;
}

export function describeTimelineStep(hookEvent: HookEventRow): TimelineStep {
  return withoutUndefined({
    id: hookEvent.id,
    receivedAt: hookEvent.received_at,
    ...describeByHook(hookEvent.hook_event_name, asRecord(hookEvent.payload)),
  });
}

// Merges items that arrive live with those already shown: each id once, oldest first.
export function mergeTimelineItems<Item extends { id: string; receivedAt: string }>(
  current: Item[],
  incoming: Item[],
): Item[] {
  const byId = new Map(current.map((item) => [item.id, item]));
  for (const item of incoming) {
    byId.set(item.id, item);
  }
  return [...byId.values()].sort((left, right) => left.receivedAt.localeCompare(right.receivedAt));
}
