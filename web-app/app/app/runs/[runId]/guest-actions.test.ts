// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { inviteGuestAction } from "./guest-actions";

const { getCurrentUserMock, createRunGuestInviteMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  createRunGuestInviteMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/runs/guests", () => ({ createRunGuestInvite: createRunGuestInviteMock }));
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "ai-multiplayer.vercel.app",
      }),
    ),
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function guestForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("inviteGuestAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    createRunGuestInviteMock.mockReset();
  });

  it("creates a guest link for the run on this site", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "driver-1", email: "dev@agency.example" });
    createRunGuestInviteMock.mockResolvedValueOnce({
      status: "created",
      inviteUrl: "https://ai-multiplayer.vercel.app/guest/token",
    });

    const state = await inviteGuestAction(
      { status: "idle" },
      guestForm({ runId: "run-1", email: " Buyer@Client.example " }),
    );

    expect(state).toEqual({
      status: "created",
      email: "buyer@client.example",
      inviteUrl: "https://ai-multiplayer.vercel.app/guest/token",
    });
    expect(createRunGuestInviteMock).toHaveBeenCalledWith({
      runId: "run-1",
      inviterId: "driver-1",
      email: "buyer@client.example",
      origin: "https://ai-multiplayer.vercel.app",
    });
  });

  it("rejects an invalid email without contacting the database", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "driver-1", email: "dev@agency.example" });

    const state = await inviteGuestAction(
      { status: "idle" },
      guestForm({ runId: "run-1", email: "not an email" }),
    );

    expect(state).toEqual({ status: "invalid_email" });
    expect(createRunGuestInviteMock).not.toHaveBeenCalled();
  });

  it("reports a refusal when the user is not on the run's team", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-1", email: "buyer@client.example" });
    createRunGuestInviteMock.mockResolvedValueOnce({ status: "refused" });

    const state = await inviteGuestAction(
      { status: "idle" },
      guestForm({ runId: "run-1", email: "friend@client.example" }),
    );

    expect(state).toEqual({ status: "refused" });
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(
      inviteGuestAction({ status: "idle" }, guestForm({ runId: "run-1", email: "a@b.co" })),
    ).rejects.toThrow("REDIRECT /login");
  });
});
