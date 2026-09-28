// @vitest-environment node
import { describe, expect, it } from "vitest";
import { originFromHeaders } from "./request-origin";

describe("originFromHeaders", () => {
  it("uses the forwarded protocol and host set by Vercel", () => {
    const headers = new Headers({
      "x-forwarded-proto": "https",
      "x-forwarded-host": "ai-multiplayer.vercel.app",
      host: "internal:3000",
    });

    expect(originFromHeaders(headers)).toBe("https://ai-multiplayer.vercel.app");
  });

  it("falls back to the host header over http for local development", () => {
    expect(originFromHeaders(new Headers({ host: "localhost:3000" }))).toBe(
      "http://localhost:3000",
    );
  });

  it("uses the first value when a proxy chain lists several", () => {
    const headers = new Headers({
      "x-forwarded-proto": "https, http",
      "x-forwarded-host": "ai-multiplayer.vercel.app, internal",
    });

    expect(originFromHeaders(headers)).toBe("https://ai-multiplayer.vercel.app");
  });

  it("refuses to build an origin without a host", () => {
    expect(() => originFromHeaders(new Headers())).toThrow("Request has no host header");
  });
});
