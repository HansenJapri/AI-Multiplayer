// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { refreshSessionAndGuard } from "./proxy-session";

const { getUserMock } = vi.hoisted(() => ({ getUserMock: vi.fn() }));

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser: getUserMock } }),
}));

function signedInAs(userId: string | null) {
  getUserMock.mockResolvedValueOnce({ data: { user: userId === null ? null : { id: userId } } });
}

describe("refreshSessionAndGuard", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://sample-project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "sample-anon-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    getUserMock.mockReset();
  });

  it("sends a signed-out visitor of /app to the login page and remembers where they were going", async () => {
    signedInAs(null);

    const response = await refreshSessionAndGuard(
      new NextRequest("http://localhost/app/workspaces/1?tab=members"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost/login?next=%2Fapp%2Fworkspaces%2F1%3Ftab%3Dmembers",
    );
  });

  it("lets a signed-in user through to /app", async () => {
    signedInAs("user-1");

    const response = await refreshSessionAndGuard(new NextRequest("http://localhost/app"));

    expect(response.headers.get("location")).toBeNull();
  });

  it("lets anyone through to public pages", async () => {
    signedInAs(null);

    const response = await refreshSessionAndGuard(new NextRequest("http://localhost/pricing"));

    expect(response.headers.get("location")).toBeNull();
  });
});
