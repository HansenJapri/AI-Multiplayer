// @vitest-environment node
import { describe, expect, it } from "vitest";
import { extractBearerToken, hashInstallToken } from "./install-token";

describe("extractBearerToken", () => {
  it("returns the token from a Bearer authorization header", () => {
    expect(extractBearerToken("Bearer aim_live_token")).toBe("aim_live_token");
  });

  it("accepts the scheme in any letter case", () => {
    expect(extractBearerToken("bearer aim_live_token")).toBe("aim_live_token");
  });

  it("ignores surrounding whitespace", () => {
    expect(extractBearerToken("  Bearer   aim_live_token  ")).toBe("aim_live_token");
  });

  it("rejects a missing header", () => {
    expect(extractBearerToken(null)).toBeNull();
  });

  it("rejects other authorization schemes", () => {
    expect(extractBearerToken("Basic dXNlcjpwYXNz")).toBeNull();
  });

  // Claude Code substitutes an empty string when the token env var is not allowed or not set.
  it("rejects an empty token", () => {
    expect(extractBearerToken("Bearer ")).toBeNull();
    expect(extractBearerToken("Bearer")).toBeNull();
  });

  it("rejects a token that contains whitespace", () => {
    expect(extractBearerToken("Bearer two parts")).toBeNull();
  });
});

describe("hashInstallToken", () => {
  it("returns the lowercase hex SHA-256 digest of the token", () => {
    // Published SHA-256 test vector for "abc" (FIPS 180-2, appendix B.1).
    expect(hashInstallToken("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});
