// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { acceptInviteAction } from "./actions";

const { getCurrentUserMock, acceptTeamInviteMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  acceptTeamInviteMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/invites", () => ({ acceptTeamInvite: acceptTeamInviteMock }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function tokenForm(token: string): FormData {
  const formData = new FormData();
  formData.set("token", token);
  return formData;
}

describe("acceptInviteAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    acceptTeamInviteMock.mockReset();
  });

  it("joins the workspace with the signed-in email and opens it", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-2", email: "friend@example.com" });
    acceptTeamInviteMock.mockResolvedValueOnce({ status: "accepted", workspaceId: "workspace-1" });

    await expect(acceptInviteAction({ status: "idle" }, tokenForm("tok"))).rejects.toThrow(
      "REDIRECT /app/workspaces/workspace-1",
    );
    expect(acceptTeamInviteMock).toHaveBeenCalledWith({
      token: "tok",
      userId: "user-2",
      email: "friend@example.com",
    });
  });

  it("reports an invite that cannot be used", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-2", email: "other@example.com" });
    acceptTeamInviteMock.mockResolvedValueOnce({ status: "invalid" });

    expect(await acceptInviteAction({ status: "idle" }, tokenForm("tok"))).toEqual({
      status: "invalid",
    });
  });

  it("asks a signed-out visitor to sign in and come back to the invite", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(acceptInviteAction({ status: "idle" }, tokenForm("tok"))).rejects.toThrow(
      "REDIRECT /login?next=%2Finvite%2Ftok",
    );
  });
});
