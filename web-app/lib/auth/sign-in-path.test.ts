// @vitest-environment node
import { describe, expect, it } from "vitest";
import { signInPath, withNextPath } from "./sign-in-path";

describe("signInPath", () => {
  it("sends the visitor to login with the page to come back to", () => {
    expect(signInPath("/invite/abc")).toBe("/login?next=%2Finvite%2Fabc");
  });
});

describe("withNextPath", () => {
  it("adds the page to return to, or nothing when there is none", () => {
    expect(withNextPath("/signup", "/guest/t")).toBe("/signup?next=%2Fguest%2Ft");
    expect(withNextPath("/signup", null)).toBe("/signup");
  });
});
