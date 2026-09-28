// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { hashOpaqueToken } from "@/lib/security/opaque-token";
import {
  approveDeviceLogin,
  claimDeviceLogin,
  DEVICE_LOGIN_LIFETIME_SECONDS,
  DEVICE_LOGIN_POLL_INTERVAL_SECONDS,
  DeviceLoginStoreError,
  generateUserCode,
  startDeviceLogin,
} from "./device-login";

const { rpcMock } = vi.hoisted(() => ({ rpcMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));

const ORIGIN = "https://ai-multiplayer.vercel.app";
const UNIQUE_VIOLATION = "23505";

describe("generateUserCode", () => {
  it("returns two groups of four characters without ambiguous letters or digits", () => {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      expect(generateUserCode()).toMatch(/^[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/);
    }
  });
});

describe("startDeviceLogin", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("stores the device code hash with a user code and returns what the CLI shows", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    const login = await startDeviceLogin(ORIGIN);

    expect(rpcMock).toHaveBeenCalledWith("start_cli_device_login", {
      p_device_code_hash: hashOpaqueToken(login.deviceCode),
      p_user_code: login.userCode,
    });
    expect(login.verificationUrl).toBe(
      `${ORIGIN}/cli/activate?code=${encodeURIComponent(login.userCode)}`,
    );
    expect(login.expiresInSeconds).toBe(DEVICE_LOGIN_LIFETIME_SECONDS);
    expect(login.intervalSeconds).toBe(DEVICE_LOGIN_POLL_INTERVAL_SECONDS);
  });

  it("draws a new user code when the first one collides with a pending login", async () => {
    rpcMock
      .mockResolvedValueOnce({ data: null, error: { code: UNIQUE_VIOLATION, message: "dup" } })
      .mockResolvedValueOnce({ data: null, error: null });

    await startDeviceLogin(ORIGIN);

    expect(rpcMock).toHaveBeenCalledTimes(2);
  });

  it("gives up after repeated collisions", async () => {
    rpcMock.mockResolvedValue({ data: null, error: { code: UNIQUE_VIOLATION, message: "dup" } });

    await expect(startDeviceLogin(ORIGIN)).rejects.toThrow(DeviceLoginStoreError);
  });
});

describe("approveDeviceLogin", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("approves the user code for the chosen workspace", async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });

    expect(await approveDeviceLogin("abcd-efgh", "user-1", "workspace-1")).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("approve_cli_device_login", {
      p_user_code: "ABCD-EFGH",
      p_user_id: "user-1",
      p_workspace_id: "workspace-1",
    });
  });
});

describe("claimDeviceLogin", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("issues an install token once the login is approved and stores only its hash", async () => {
    rpcMock
      .mockResolvedValueOnce({ data: "approved", error: null })
      .mockResolvedValueOnce({ data: "workspace-1", error: null });

    const result = await claimDeviceLogin("device-code");

    if (result.status !== "claimed") {
      throw new Error(`expected claimed, got ${result.status}`);
    }
    expect(result.workspaceId).toBe("workspace-1");
    expect(rpcMock).toHaveBeenLastCalledWith("claim_cli_device_login", {
      p_device_code_hash: hashOpaqueToken("device-code"),
      p_install_token_hash: hashOpaqueToken(result.installToken),
    });
  });

  it.each(["pending", "expired", "unknown"] as const)("reports a %s login", async (status) => {
    rpcMock.mockResolvedValueOnce({ data: status, error: null });

    expect(await claimDeviceLogin("device-code")).toEqual({ status });
    expect(rpcMock).toHaveBeenCalledTimes(1);
  });

  it("treats an already claimed login as unknown so a replayed device code learns nothing", async () => {
    rpcMock.mockResolvedValueOnce({ data: "claimed", error: null });

    expect(await claimDeviceLogin("device-code")).toEqual({ status: "unknown" });
  });

  it("treats a lost race to claim as unknown", async () => {
    rpcMock
      .mockResolvedValueOnce({ data: "approved", error: null })
      .mockResolvedValueOnce({ data: null, error: null });

    expect(await claimDeviceLogin("device-code")).toEqual({ status: "unknown" });
  });
});
