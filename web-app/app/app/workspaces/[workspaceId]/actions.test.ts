// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { inviteTeammateAction } from "./actions";

const { getCurrentUserMock, createTeamInviteMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  createTeamInviteMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/invites", () => ({ createTeamInvite: createTeamInviteMock }));
vi.mock("next/headers", () => ({
  headers: () => Promise.resolve(new Headers({ host: "localhost:3000" })),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function inviteForm(fields: { workspaceId: string; email: string }): FormData {
  const formData = new FormData();
  formData.set("workspaceId", fields.workspaceId);
  formData.set("email", fields.email);
  return formData;
}

describe("inviteTeammateAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    createTeamInviteMock.mockReset();
  });

  it("creates an invite link for the email on the current origin", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });
    createTeamInviteMock.mockResolvedValueOnce({
      status: "created",
      inviteUrl: "http://localhost:3000/invite/token",
    });

    const state = await inviteTeammateAction(
      { status: "idle" },
      inviteForm({ workspaceId: "workspace-1", email: "Friend@Example.com" }),
    );

    expect(state).toEqual({
      status: "created",
      email: "friend@example.com",
      inviteUrl: "http://localhost:3000/invite/token",
    });
    expect(createTeamInviteMock).toHaveBeenCalledWith({
      workspaceId: "workspace-1",
      inviterId: "owner-1",
      email: "friend@example.com",
      origin: "http://localhost:3000",
    });
  });

  it("rejects an invalid email", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });

    const state = await inviteTeammateAction(
      { status: "idle" },
      inviteForm({ workspaceId: "workspace-1", email: "nope" }),
    );

    expect(state).toEqual({ status: "invalid_email" });
    expect(createTeamInviteMock).not.toHaveBeenCalled();
  });

  it("tells a driver that only owners can invite", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "driver-1", email: "driver@agency.example" });
    createTeamInviteMock.mockResolvedValueOnce({ status: "not_owner" });

    const state = await inviteTeammateAction(
      { status: "idle" },
      inviteForm({ workspaceId: "workspace-1", email: "a@b.co" }),
    );

    expect(state).toEqual({ status: "not_owner" });
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(
      inviteTeammateAction({ status: "idle" }, inviteForm({ workspaceId: "w", email: "a@b.co" })),
    ).rejects.toThrow("REDIRECT /login");
  });
});
