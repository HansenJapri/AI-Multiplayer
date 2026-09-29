// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { isOperatorEmail } from "./operators";

describe("isOperatorEmail", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("recognises an email listed in OPERATOR_EMAILS, ignoring case and spaces", () => {
    vi.stubEnv("OPERATOR_EMAILS", " Ops@AIMultiplayer.example , founder@example.com");

    expect(isOperatorEmail("ops@aimultiplayer.example")).toBe(true);
    expect(isOperatorEmail("FOUNDER@example.com")).toBe(true);
    expect(isOperatorEmail("someone@example.com")).toBe(false);
  });

  it("has no operators when the variable is unset or empty", () => {
    vi.stubEnv("OPERATOR_EMAILS", "");

    expect(isOperatorEmail("")).toBe(false);
    expect(isOperatorEmail("ops@aimultiplayer.example")).toBe(false);
  });
});
