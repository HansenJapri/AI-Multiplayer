// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { markDepositPaidAction } from "./actions";

const { getCurrentUserMock, completeDepositMock, revalidatePathMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  completeDepositMock: vi.fn(),
  revalidatePathMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/billing/deposits", () => ({ completeDeposit: completeDepositMock }));
vi.mock("next/cache", () => ({ revalidatePath: revalidatePathMock }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function paidForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("markDepositPaidAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    completeDepositMock.mockReset();
    revalidatePathMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("lets an operator mark a deposit paid with the payment reference", async () => {
    vi.stubEnv("OPERATOR_EMAILS", "ops@example.com");
    getCurrentUserMock.mockResolvedValueOnce({ id: "ops-1", email: "ops@example.com" });
    completeDepositMock.mockResolvedValueOnce(true);

    await markDepositPaidAction(paidForm({ depositId: "deposit-1", reference: " wire 42 " }));

    expect(completeDepositMock).toHaveBeenCalledWith("deposit-1", "wire 42");
    expect(revalidatePathMock).toHaveBeenCalledWith("/app/ops/deposits");
  });

  it("records the manual provider as the reference when none is given", async () => {
    vi.stubEnv("OPERATOR_EMAILS", "ops@example.com");
    getCurrentUserMock.mockResolvedValueOnce({ id: "ops-1", email: "ops@example.com" });
    completeDepositMock.mockResolvedValueOnce(true);

    await markDepositPaidAction(paidForm({ depositId: "deposit-1", reference: "" }));

    expect(completeDepositMock).toHaveBeenCalledWith("deposit-1", "manual");
  });

  it("answers not found to anyone who is not an operator", async () => {
    vi.stubEnv("OPERATOR_EMAILS", "ops@example.com");
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });

    await expect(markDepositPaidAction(paidForm({ depositId: "deposit-1" }))).rejects.toThrow(
      "NOT_FOUND",
    );
    expect(completeDepositMock).not.toHaveBeenCalled();
  });

  it("answers not found to a signed-out visitor", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(markDepositPaidAction(paidForm({ depositId: "deposit-1" }))).rejects.toThrow(
      "NOT_FOUND",
    );
  });
});
