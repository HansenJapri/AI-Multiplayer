// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

const { exchangeCodeForSessionMock } = vi.hoisted(() => ({
  exchangeCodeForSessionMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () =>
    Promise.resolve({ auth: { exchangeCodeForSession: exchangeCodeForSessionMock } }),
}));

describe("GET /auth/callback", () => {
  afterEach(() => {
    exchangeCodeForSessionMock.mockReset();
  });

  it("exchanges the code for a session and continues to the next path", async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: null });

    const response = await GET(
      new NextRequest(
        "https://ai-multiplayer.vercel.app/auth/callback?code=abc&next=%2Finvite%2Fx",
      ),
    );

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe("https://ai-multiplayer.vercel.app/invite/x");
  });

  it("never follows a next path to another site", async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: null });

    const response = await GET(
      new NextRequest(
        "https://ai-multiplayer.vercel.app/auth/callback?code=abc&next=%2F%2Fevil.example.com",
      ),
    );

    expect(response.headers.get("location")).toBe("https://ai-multiplayer.vercel.app/app");
  });

  it("sends the user back to login when the link is invalid or expired", async () => {
    exchangeCodeForSessionMock.mockResolvedValueOnce({ error: { message: "expired" } });

    const response = await GET(
      new NextRequest("https://ai-multiplayer.vercel.app/auth/callback?code=old"),
    );

    expect(response.headers.get("location")).toBe(
      "https://ai-multiplayer.vercel.app/login?error=link_invalid",
    );
  });

  it("sends the user back to login when the code is missing", async () => {
    const response = await GET(new NextRequest("https://ai-multiplayer.vercel.app/auth/callback"));

    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe(
      "https://ai-multiplayer.vercel.app/login?error=link_invalid",
    );
  });
});
