// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildAuthCallbackUrl, safeRedirectPath, SIGNED_IN_HOME_PATH } from "./redirects";

describe("safeRedirectPath", () => {
  it("keeps a same-site absolute path with its query", () => {
    expect(safeRedirectPath("/invite/abc?x=1")).toBe("/invite/abc?x=1");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["relative", "app"],
    ["protocol-relative", "//evil.example.com"],
    ["backslash trick", String.raw`/\evil.example.com`],
    ["absolute URL", "https://evil.example.com/app"],
  ])("falls back to the signed-in home for a %s target", (_label, target) => {
    expect(safeRedirectPath(target)).toBe(SIGNED_IN_HOME_PATH);
  });
});

describe("buildAuthCallbackUrl", () => {
  it("points at /auth/callback on the given origin and carries the safe next path", () => {
    expect(buildAuthCallbackUrl("https://ai-multiplayer.vercel.app", "/invite/abc")).toBe(
      "https://ai-multiplayer.vercel.app/auth/callback?next=%2Finvite%2Fabc",
    );
  });

  it("replaces an unsafe next path with the signed-in home", () => {
    expect(buildAuthCallbackUrl("http://localhost:3000", "//evil.example.com")).toBe(
      "http://localhost:3000/auth/callback?next=%2Fapp",
    );
  });
});
