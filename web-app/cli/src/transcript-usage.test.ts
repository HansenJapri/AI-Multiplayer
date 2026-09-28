// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readLatestUsage } from "./transcript-usage.js";

function transcriptLine(entry: unknown): string {
  return JSON.stringify(entry);
}

describe("readLatestUsage", () => {
  it("returns the token usage and model of the last assistant message", () => {
    const transcript = [
      transcriptLine({ type: "user", message: { role: "user", content: "hi" } }),
      transcriptLine({
        type: "assistant",
        message: {
          model: "claude-sonnet-5",
          usage: { input_tokens: 10, output_tokens: 5 },
        },
      }),
      transcriptLine({
        type: "assistant",
        message: {
          model: "claude-opus-5-5",
          usage: {
            input_tokens: 1200,
            output_tokens: 340,
            cache_read_input_tokens: 9000,
            cache_creation_input_tokens: 50,
          },
        },
      }),
      transcriptLine({ type: "user", message: { role: "user", content: "tool result" } }),
    ].join("\n");

    expect(readLatestUsage(transcript)).toEqual({
      model: "claude-opus-5-5",
      input_tokens: 1200,
      output_tokens: 340,
      cache_read_input_tokens: 9000,
      cache_creation_input_tokens: 50,
    });
  });

  it("fills missing cache counters with zero", () => {
    const transcript = transcriptLine({
      type: "assistant",
      message: { model: "claude-sonnet-5", usage: { input_tokens: 3, output_tokens: 4 } },
    });

    expect(readLatestUsage(transcript)).toEqual({
      model: "claude-sonnet-5",
      input_tokens: 3,
      output_tokens: 4,
      cache_read_input_tokens: 0,
      cache_creation_input_tokens: 0,
    });
  });

  it("returns null when no assistant message has usage", () => {
    expect(readLatestUsage("")).toBeNull();
    expect(readLatestUsage(transcriptLine({ type: "user" }))).toBeNull();
  });

  it("skips lines that are not valid JSON", () => {
    const transcript = [
      transcriptLine({
        type: "assistant",
        message: { model: "m", usage: { input_tokens: 1, output_tokens: 2 } },
      }),
      "{not json",
    ].join("\n");

    expect(readLatestUsage(transcript)?.output_tokens).toBe(2);
  });
});
