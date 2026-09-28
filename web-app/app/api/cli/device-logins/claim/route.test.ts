// @vitest-environment node
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { claimDeviceLoginMock } = vi.hoisted(() => ({ claimDeviceLoginMock: vi.fn() }));

vi.mock("@/lib/cli/device-login", () => ({ claimDeviceLogin: claimDeviceLoginMock }));

function claimRequest(body: unknown): NextRequest {
  return new NextRequest("https://ai-multiplayer.vercel.app/api/cli/device-logins/claim", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/cli/device-logins/claim", () => {
  afterEach(() => {
    claimDeviceLoginMock.mockReset();
  });

  it("hands the install token to the CLI once the login is approved", async () => {
    claimDeviceLoginMock.mockResolvedValueOnce({
      status: "claimed",
      installToken: "install-token",
      workspaceId: "workspace-1",
    });

    const response = await POST(claimRequest({ device_code: "device-code" }));

    expect(claimDeviceLoginMock).toHaveBeenCalledWith("device-code");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "approved",
      install_token: "install-token",
      workspace_id: "workspace-1",
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it.each([
    ["pending", 202],
    ["expired", 410],
    ["unknown", 404],
  ] as const)("answers a %s login with %i", async (status, httpStatus) => {
    claimDeviceLoginMock.mockResolvedValueOnce({ status });

    const response = await POST(claimRequest({ device_code: "device-code" }));

    expect(response.status).toBe(httpStatus);
    expect(await response.json()).toEqual({ status });
  });

  it("rejects a request without a device code", async () => {
    const response = await POST(claimRequest({}));

    expect(response.status).toBe(400);
    expect(claimDeviceLoginMock).not.toHaveBeenCalled();
  });
});
