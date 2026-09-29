// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { acceptGuestInviteAction } from "./actions";

const { getCurrentUserMock, acceptRunGuestInviteMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  acceptRunGuestInviteMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/runs/guests", () => ({ acceptRunGuestInvite: acceptRunGuestInviteMock }));
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

describe("acceptGuestInviteAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    acceptRunGuestInviteMock.mockReset();
  });

  it("gives the signed-in client access and opens the shared run", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-1", email: "buyer@client.example" });
    acceptRunGuestInviteMock.mockResolvedValueOnce({ status: "accepted", runId: "run-1" });

    await expect(acceptGuestInviteAction({ status: "idle" }, tokenForm("tok"))).rejects.toThrow(
      "REDIRECT /app/runs/run-1",
    );
    expect(acceptRunGuestInviteMock).toHaveBeenCalledWith({
      token: "tok",
      userId: "client-1",
      email: "buyer@client.example",
    });
  });

  it("reports an invite that cannot be used", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-2", email: "other@client.example" });
    acceptRunGuestInviteMock.mockResolvedValueOnce({ status: "invalid" });

    expect(await acceptGuestInviteAction({ status: "idle" }, tokenForm("tok"))).toEqual({
      status: "invalid",
    });
  });

  it("asks a signed-out visitor to sign in and come back to the invite", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(acceptGuestInviteAction({ status: "idle" }, tokenForm("tok"))).rejects.toThrow(
      "REDIRECT /login?next=%2Fguest%2Ftok",
    );
  });
});
