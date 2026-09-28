import { readLatestUsage } from "./transcript-usage.js";

export interface AimCredentials {
  apiUrl: string;
  installToken: string;
  workspaceId: string;
}

export interface HookForwarderDependencies {
  readCredentials: () => Promise<AimCredentials | null>;
  readTranscript: (transcriptPath: string) => Promise<string | null>;
  fetch: typeof fetch;
}

// Well under the hook timeout, so a slow server never holds up the agent for long.
const INGEST_TIMEOUT_MILLISECONDS = 5000;
const EVENTS_WITH_USAGE = new Set(["PostToolUse", "Stop"]);

function parseHookBody(hookBody: string): Record<string, unknown> | null {
  try {
    const body: unknown = JSON.parse(hookBody);
    return typeof body === "object" && body !== null && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function withUsage(
  hookBody: string,
  readTranscript: HookForwarderDependencies["readTranscript"],
): Promise<string> {
  const body = parseHookBody(hookBody);
  const eventName = body?.hook_event_name;
  const transcriptPath = body?.transcript_path;
  if (
    body === null ||
    typeof eventName !== "string" ||
    !EVENTS_WITH_USAGE.has(eventName) ||
    typeof transcriptPath !== "string"
  ) {
    return hookBody;
  }
  const transcript = await readTranscript(transcriptPath);
  const usage = transcript === null ? null : readLatestUsage(transcript);
  return usage === null ? hookBody : JSON.stringify({ ...body, aim_usage: usage });
}

// Returns what the hook prints on stdout: the server's reply (which may steer or hold the agent),
// or nothing. Every failure is silent so a broken connection never blocks Claude Code.
export async function forwardHook(
  hookBody: string,
  dependencies: HookForwarderDependencies,
): Promise<string> {
  try {
    const credentials = await dependencies.readCredentials();
    if (credentials === null) {
      return "";
    }
    const response = await dependencies.fetch(`${credentials.apiUrl}/api/hooks/ingest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.installToken}`,
        "Content-Type": "application/json",
      },
      body: await withUsage(hookBody, dependencies.readTranscript),
      signal: AbortSignal.timeout(INGEST_TIMEOUT_MILLISECONDS),
    });
    return response.ok ? await response.text() : "";
  } catch {
    return "";
  }
}
