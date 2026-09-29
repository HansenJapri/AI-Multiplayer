// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { signUpAction } from "./actions";

const { signUpMock } = vi.hoisted(() => ({ signUpMock: vi.fn() }));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ auth: { signUp: signUpMock } }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function signupForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

const SESSION = { access_token: "a", refresh_token: "r" };

describe("signUpAction", () => {
  afterEach(() => {
    signUpMock.mockReset();
  });

  it("creates the account, signs the user in and returns to the requested page", async () => {
    signUpMock.mockResolvedValueOnce({ data: { session: SESSION }, error: null });

    await expect(
      signUpAction(
        { status: "idle" },
        signupForm({ email: "New@Agency.Example", password: "correct horse", next: "/guest/t" }),
      ),
    ).rejects.toThrow("REDIRECT /guest/t");
    expect(signUpMock).toHaveBeenCalledWith({
      email: "new@agency.example",
      password: "correct horse",
    });
  });

  it("goes to the dashboard when no page was requested", async () => {
    signUpMock.mockResolvedValueOnce({ data: { session: SESSION }, error: null });

    await expect(
      signUpAction({ status: "idle" }, signupForm({ email: "a@b.co", password: "correct horse" })),
    ).rejects.toThrow("REDIRECT /app");
  });

  it("asks the user to confirm their email when the project requires it", async () => {
    signUpMock.mockResolvedValueOnce({ data: { session: null }, error: null });

    expect(
      await signUpAction(
        { status: "idle" },
        signupForm({ email: "a@b.co", password: "correct horse" }),
      ),
    ).toEqual({ status: "check_email", email: "a@b.co" });
  });

  it("rejects an invalid email or a short password without contacting Supabase", async () => {
    expect(
      await signUpAction(
        { status: "idle" },
        signupForm({ email: "nope", password: "long enough" }),
      ),
    ).toEqual({ status: "invalid_email" });
    expect(
      await signUpAction({ status: "idle" }, signupForm({ email: "a@b.co", password: "short" })),
    ).toEqual({ status: "weak_password" });
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("says when the email already has an account", async () => {
    signUpMock.mockResolvedValueOnce({
      data: { session: null },
      error: { status: 422, code: "user_already_exists" },
    });

    expect(
      await signUpAction(
        { status: "idle" },
        signupForm({ email: "a@b.co", password: "correct horse" }),
      ),
    ).toEqual({ status: "email_taken" });
  });

  it("passes on Supabase's own password rules", async () => {
    signUpMock.mockResolvedValueOnce({
      data: { session: null },
      error: { status: 422, code: "weak_password" },
    });

    expect(
      await signUpAction({ status: "idle" }, signupForm({ email: "a@b.co", password: "password" })),
    ).toEqual({ status: "weak_password" });
  });

  it("tells the user to wait when Supabase rate-limits sign-ups, and fails generically otherwise", async () => {
    signUpMock.mockResolvedValueOnce({
      data: { session: null },
      error: { status: 429, code: "over_request_rate_limit" },
    });
    signUpMock.mockResolvedValueOnce({
      data: { session: null },
      error: { status: 500, code: "unexpected_failure" },
    });

    const form = signupForm({ email: "a@b.co", password: "correct horse" });
    expect(await signUpAction({ status: "idle" }, form)).toEqual({ status: "rate_limited" });
    expect(await signUpAction({ status: "idle" }, form)).toEqual({ status: "failed" });
  });
});
