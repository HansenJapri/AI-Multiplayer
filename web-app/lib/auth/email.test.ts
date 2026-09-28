// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseEmailAddress } from "./email";

describe("parseEmailAddress", () => {
  it("trims and lowercases a valid address", () => {
    expect(parseEmailAddress("  Dev@Agency.Example ")).toBe("dev@agency.example");
  });

  it.each([null, "", "no-at-sign", "two@@example.com", "space in@example.com", "a@b", 42])(
    "rejects %j",
    (value) => {
      expect(parseEmailAddress(value)).toBeNull();
    },
  );
});
