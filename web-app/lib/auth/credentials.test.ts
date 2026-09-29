// @vitest-environment node
import { describe, expect, it } from "vitest";
import { MIN_PASSWORD_LENGTH, parseCredentials } from "./credentials";

function credentialsForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("parseCredentials", () => {
  it("normalizes the email and keeps the password exactly as typed", () => {
    expect(
      parseCredentials(
        credentialsForm({ email: " Dev@Agency.Example ", password: " secret pass " }),
      ),
    ).toEqual({ ok: true, email: "dev@agency.example", password: " secret pass " });
  });

  it("rejects an invalid email", () => {
    expect(parseCredentials(credentialsForm({ email: "nope", password: "long enough" }))).toEqual({
      ok: false,
      reason: "invalid_email",
    });
  });

  it("rejects a password shorter than the minimum", () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(parseCredentials(credentialsForm({ email: "a@b.co", password: "1234567" }))).toEqual({
      ok: false,
      reason: "weak_password",
    });
  });

  it("rejects a password longer than 72 bytes, which the hash would silently truncate", () => {
    expect(
      parseCredentials(credentialsForm({ email: "a@b.co", password: "x".repeat(73) })),
    ).toEqual({ ok: false, reason: "weak_password" });
  });

  it("treats a missing password as too short", () => {
    expect(parseCredentials(credentialsForm({ email: "a@b.co" }))).toEqual({
      ok: false,
      reason: "weak_password",
    });
  });
});
