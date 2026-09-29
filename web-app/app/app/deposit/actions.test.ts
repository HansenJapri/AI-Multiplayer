// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { startDepositAction } from "./actions";

const { getCurrentUserMock, startDepositMock, revalidatePathMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  startDepositMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/billing/deposits", () => ({ startDeposit: startDepositMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
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

function depositForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

const OWNER = { id: "owner-1", email: "owner@agency.example" };

describe("startDepositAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    startDepositMock.mockReset();
    revalidatePathMock.mockReset();
  });

  it("starts a deposit for the chosen workspace, plan and drivers, then shows the instructions", async () => {
    getCurrentUserMock.mockResolvedValueOnce(OWNER);
    startDepositMock.mockResolvedValueOnce({
      status: "started",
      checkout: { kind: "instructions", reference: "DEP-1", message: "We will email you." },
    });

    const state = await startDepositAction(
      { status: "idle" },
      depositForm({ workspaceId: "workspace-1", plan: "team", seats: "3" }),
    );

    expect(state).toEqual({
      status: "instructions",
      reference: "DEP-1",
      message: "We will email you.",
    });
    expect(startDepositMock).toHaveBeenCalledWith({
      workspaceId: "workspace-1",
      userId: "owner-1",
      customerEmail: "owner@agency.example",
      plan: "team",
      seats: 3,
      origin: "https://ai-multiplayer.vercel.app",
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/deposit");
  });

  it("sends the owner to a hosted checkout when the provider has one", async () => {
    getCurrentUserMock.mockResolvedValueOnce(OWNER);
    startDepositMock.mockResolvedValueOnce({
      status: "started",
      checkout: { kind: "redirect", url: "https://pay.example/c/1" },
    });

    await expect(
      startDepositAction(
        { status: "idle" },
        depositForm({ workspaceId: "workspace-1", plan: "agency" }),
      ),
    ).rejects.toThrow("REDIRECT https://pay.example/c/1");
  });

  it("rejects an unknown plan without contacting the database", async () => {
    getCurrentUserMock.mockResolvedValueOnce(OWNER);

    expect(
      await startDepositAction(
        { status: "idle" },
        depositForm({ workspaceId: "workspace-1", plan: "free" }),
      ),
    ).toEqual({ status: "invalid_plan" });
    expect(startDepositMock).not.toHaveBeenCalled();
  });

  it("passes on a refusal for a non-owner or an invalid seat count", async () => {
    getCurrentUserMock.mockResolvedValue(OWNER);
    startDepositMock.mockResolvedValueOnce({ status: "not_owner" });
    startDepositMock.mockResolvedValueOnce({ status: "invalid_seats" });

    const form = depositForm({ workspaceId: "workspace-1", plan: "team", seats: "abc" });
    expect(await startDepositAction({ status: "idle" }, form)).toEqual({ status: "not_owner" });
    expect(await startDepositAction({ status: "idle" }, form)).toEqual({ status: "invalid_seats" });
    expect(startDepositMock).toHaveBeenLastCalledWith(expect.objectContaining({ seats: NaN }));
  });

  it("sends a signed-out visitor to login and back here", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(
      startDepositAction({ status: "idle" }, depositForm({ plan: "team" })),
    ).rejects.toThrow("REDIRECT /login?next=%2Fapp%2Fdeposit");
  });
});
