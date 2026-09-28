// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { approveCliLoginAction } from "./actions";

const { getCurrentUserMock, approveDeviceLoginMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  approveDeviceLoginMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/cli/device-login", () => ({ approveDeviceLogin: approveDeviceLoginMock }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function approvalForm(fields: { userCode: string; workspaceId: string }): FormData {
  const formData = new FormData();
  formData.set("userCode", fields.userCode);
  formData.set("workspaceId", fields.workspaceId);
  return formData;
}

describe("approveCliLoginAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    approveDeviceLoginMock.mockReset();
  });

  it("approves the code for the chosen workspace", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    approveDeviceLoginMock.mockResolvedValueOnce(true);

    const state = await approveCliLoginAction(
      { status: "idle" },
      approvalForm({ userCode: "abcd-efgh", workspaceId: "workspace-1" }),
    );

    expect(state).toEqual({ status: "approved" });
    expect(approveDeviceLoginMock).toHaveBeenCalledWith("abcd-efgh", "user-1", "workspace-1");
  });

  it("reports a code that is wrong, expired or already used", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    approveDeviceLoginMock.mockResolvedValueOnce(false);

    const state = await approveCliLoginAction(
      { status: "idle" },
      approvalForm({ userCode: "ZZZZ-ZZZZ", workspaceId: "workspace-1" }),
    );

    expect(state).toEqual({ status: "invalid" });
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(
      approveCliLoginAction({ status: "idle" }, approvalForm({ userCode: "A", workspaceId: "w" })),
    ).rejects.toThrow("REDIRECT /login?next=%2Fcli%2Factivate");
  });
});
