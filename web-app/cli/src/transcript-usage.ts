export interface TokenUsage {
  model: string;
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

interface TranscriptEntry {
  type?: unknown;
  message?: { model?: unknown; usage?: Record<string, unknown> };
}

function parseEntry(line: string): TranscriptEntry | null {
  try {
    const entry: unknown = JSON.parse(line);
    return typeof entry === "object" && entry !== null ? entry : null;
  } catch {
    return null;
  }
}

function tokenCount(usage: Record<string, unknown>, field: string): number {
  const value = usage[field];
  return typeof value === "number" ? value : 0;
}

// Claude Code writes the session transcript as JSON Lines; the newest assistant message carries
// the token usage of the latest model call. Tokens are reported as-is; the app never prices them.
export function readLatestUsage(transcript: string): TokenUsage | null {
  const lines = transcript.split("\n");
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const entry = parseEntry(lines[index] ?? "");
    const usage = entry?.message?.usage;
    if (entry?.type === "assistant" && usage !== undefined) {
      const model = entry.message?.model;
      return {
        model: typeof model === "string" ? model : "unknown",
        input_tokens: tokenCount(usage, "input_tokens"),
        output_tokens: tokenCount(usage, "output_tokens"),
        cache_read_input_tokens: tokenCount(usage, "cache_read_input_tokens"),
        cache_creation_input_tokens: tokenCount(usage, "cache_creation_input_tokens"),
      };
    }
  }
  return null;
}
