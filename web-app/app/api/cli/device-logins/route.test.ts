// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { startDeviceLoginMock } = vi.hoisted(() => ({ startDeviceLoginMock: vi.fn() }));

vi.mock("@/lib/cli/device-login", () => ({ startDeviceLogin: startDeviceLoginMock }));

describe("POST /api/cli/device-logins", () => {
  it("starts a device login on the request origin and answers in snake_case for the CLI", async () => {
    startDeviceLoginMock.mockResolvedValueOnce({
      deviceCode: "device-code",
      userCode: "ABCD-EFGH",
      verificationUrl: "https://ai-multiplayer.vercel.app/cli/activate?code=ABCD-EFGH",
      expiresInSeconds: 600,
      intervalSeconds: 3,
    });

    const response = await POST(
      new NextRequest("https://ai-multiplayer.vercel.app/api/cli/device-logins", {
        method: "POST",
        headers: { "x-forwarded-proto": "https", "x-forwarded-host": "ai-multiplayer.vercel.app" },
      }),
    );

    expect(startDeviceLoginMock).toHaveBeenCalledWith("https://ai-multiplayer.vercel.app");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      device_code: "device-code",
      user_code: "ABCD-EFGH",
      verification_url: "https://ai-multiplayer.vercel.app/cli/activate?code=ABCD-EFGH",
      expires_in: 600,
      interval: 3,
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
