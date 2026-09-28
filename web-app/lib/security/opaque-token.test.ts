// @vitest-environment node
import { describe, expect, it } from "vitest";
import { generateOpaqueToken, hashOpaqueToken } from "./opaque-token";

describe("generateOpaqueToken", () => {
  it("returns 32 random bytes as URL-safe base64 without padding", () => {
    expect(generateOpaqueToken()).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("returns a different token every time", () => {
    expect(generateOpaqueToken()).not.toBe(generateOpaqueToken());
  });
});

describe("hashOpaqueToken", () => {
  it("returns the lowercase hex SHA-256 digest of the token", () => {
    // Published SHA-256 test vector for "abc" (FIPS 180-2, appendix B.1).
    expect(hashOpaqueToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
