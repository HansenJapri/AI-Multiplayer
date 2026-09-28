// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { signOutMock } = vi.hoisted(() => ({
  signOutMock: vi.fn(() => Promise.resolve({ error: null })),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ auth: { signOut: signOutMock } }),
}));

describe("POST /auth/sign-out", () => {
  it("ends the session and returns to the home page with a See Other redirect", async () => {
    const response = await POST(
      new NextRequest("https://ai-multiplayer.vercel.app/auth/sign-out", { method: "POST" }),
    );

    expect(signOutMock).toHaveBeenCalledOnce();
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://ai-multiplayer.vercel.app/");
  });
});
