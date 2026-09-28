// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { sendMagicLink } from "./actions";

const { signInWithOtpMock } = vi.hoisted(() => ({ signInWithOtpMock: vi.fn() }));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ auth: { signInWithOtp: signInWithOtpMock } }),
}));
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "ai-multiplayer.vercel.app",
      }),
    ),
}));

function loginForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("sendMagicLink", () => {
  afterEach(() => {
    signInWithOtpMock.mockReset();
  });

  it("emails a magic link that returns to the auth callback with the requested next path", async () => {
    signInWithOtpMock.mockResolvedValueOnce({ error: null });

    const state = await sendMagicLink(
      { status: "idle" },
      loginForm({ email: " Dev@Agency.Example ", next: "/invite/abc" }),
    );

    expect(state).toEqual({ status: "sent", email: "dev@agency.example" });
    expect(signInWithOtpMock).toHaveBeenCalledWith({
      email: "dev@agency.example",
      options: {
        emailRedirectTo: "https://ai-multiplayer.vercel.app/auth/callback?next=%2Finvite%2Fabc",
        shouldCreateUser: true,
      },
    });
  });

  it("rejects an invalid email without contacting Supabase", async () => {
    const state = await sendMagicLink({ status: "idle" }, loginForm({ email: "not-an-email" }));

    expect(state).toEqual({ status: "invalid_email" });
    expect(signInWithOtpMock).not.toHaveBeenCalled();
  });

  it("tells the user to wait when Supabase rate-limits emails", async () => {
    signInWithOtpMock.mockResolvedValueOnce({ error: { status: 429, message: "rate limit" } });

    const state = await sendMagicLink({ status: "idle" }, loginForm({ email: "a@b.co" }));

    expect(state).toEqual({ status: "rate_limited" });
  });

  it("reports a generic failure for any other error", async () => {
    signInWithOtpMock.mockResolvedValueOnce({ error: { status: 500, message: "boom" } });

    const state = await sendMagicLink({ status: "idle" }, loginForm({ email: "a@b.co" }));

    expect(state).toEqual({ status: "failed" });
  });
});
