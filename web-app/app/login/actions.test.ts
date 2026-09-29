// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { signInAction } from "./actions";

const { signInWithPasswordMock } = vi.hoisted(() => ({ signInWithPasswordMock: vi.fn() }));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () =>
    Promise.resolve({ auth: { signInWithPassword: signInWithPasswordMock } }),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function loginForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("signInAction", () => {
  afterEach(() => {
    signInWithPasswordMock.mockReset();
  });

  it("signs in with email and password, then returns to the requested page", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({ error: null });

    await expect(
      signInAction(
        { status: "idle" },
        loginForm({
          email: " Dev@Agency.Example ",
          password: "correct horse",
          next: "/invite/abc",
        }),
      ),
    ).rejects.toThrow("REDIRECT /invite/abc");
    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "dev@agency.example",
      password: "correct horse",
    });
  });

  it("never redirects to another site", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({ error: null });

    await expect(
      signInAction(
        { status: "idle" },
        loginForm({ email: "a@b.co", password: "correct horse", next: "//evil.example" }),
      ),
    ).rejects.toThrow("REDIRECT /app");
  });

  it("rejects an invalid email without contacting Supabase", async () => {
    expect(
      await signInAction({ status: "idle" }, loginForm({ email: "nope", password: "whatever1" })),
    ).toEqual({ status: "invalid_email" });
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("gives one answer for a wrong password, an unknown email or a too-short password", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { status: 400, code: "invalid_credentials" },
    });

    expect(
      await signInAction(
        { status: "idle" },
        loginForm({ email: "a@b.co", password: "wrong pass" }),
      ),
    ).toEqual({ status: "invalid_credentials" });
    expect(
      await signInAction({ status: "idle" }, loginForm({ email: "a@b.co", password: "short" })),
    ).toEqual({ status: "invalid_credentials" });
  });

  it("tells the user to wait when Supabase rate-limits sign-ins", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { status: 429, code: "over_request_rate_limit" },
    });

    expect(
      await signInAction(
        { status: "idle" },
        loginForm({ email: "a@b.co", password: "long enough" }),
      ),
    ).toEqual({ status: "rate_limited" });
  });

  it("reports a generic failure for any other error", async () => {
    signInWithPasswordMock.mockResolvedValueOnce({
      error: { status: 500, code: "unexpected_failure" },
    });

    expect(
      await signInAction(
        { status: "idle" },
        loginForm({ email: "a@b.co", password: "long enough" }),
      ),
    ).toEqual({ status: "failed" });
  });
});
