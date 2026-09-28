// @vitest-environment node
import { describe, expect, it } from "vitest";
import { signInPath } from "./sign-in-path";

describe("signInPath", () => {
  it("sends the visitor to login with the page to come back to", () => {
    expect(signInPath("/invite/abc")).toBe("/login?next=%2Finvite%2Fabc");
  });
});
