// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser } from "./current-user";

const { getUserMock } = vi.hoisted(() => ({ getUserMock: vi.fn() }));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ auth: { getUser: getUserMock } }),
}));

describe("getCurrentUser", () => {
  afterEach(() => {
    getUserMock.mockReset();
  });

  it("returns the signed-in user's id and email", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-1", email: "dev@agency.example" } },
      error: null,
    });

    expect(await getCurrentUser()).toEqual({ id: "user-1", email: "dev@agency.example" });
  });

  it("returns null when nobody is signed in", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: { message: "no session" } });

    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for a user without an email, since every account here signs in by email", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: { id: "user-1" } }, error: null });

    expect(await getCurrentUser()).toBeNull();
  });
});
