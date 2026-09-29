import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import OperatorDepositsPage from "./page";

const { getCurrentUserMock, listPendingDepositsMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  listPendingDepositsMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/billing/deposits", () => ({ listPendingDeposits: listPendingDepositsMock }));
vi.mock("./actions", () => ({ markDepositPaidAction: vi.fn() }));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
}));

describe("OperatorDepositsPage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listPendingDepositsMock.mockReset();
    vi.unstubAllEnvs();
  });

  it("lists pending deposits with who to contact and a way to mark each paid", async () => {
    vi.stubEnv("OPERATOR_EMAILS", "ops@example.com");
    getCurrentUserMock.mockResolvedValueOnce({ id: "ops-1", email: "ops@example.com" });
    listPendingDepositsMock.mockResolvedValueOnce([
      {
        id: "deposit-1",
        reference: "DEP-ABCDEF12",
        workspaceName: "Acme Agency",
        plan: "agency",
        seats: 1,
        amountCents: 19900,
        currency: "USD",
        status: "pending",
        createdAt: "2026-09-29T10:00:00Z",
        ownerEmail: "owner@agency.example",
      },
    ]);

    render(await OperatorDepositsPage());

    const pending = screen.getByRole("list", { name: "Pending deposits" });
    expect(pending).toHaveTextContent("DEP-ABCDEF12");
    expect(pending).toHaveTextContent("owner@agency.example");
    expect(pending).toHaveTextContent("$199");
    expect(screen.getByRole("button", { name: "Mark DEP-ABCDEF12 paid" })).toBeInTheDocument();
  });

  it("answers not found to anyone who is not an operator", async () => {
    vi.stubEnv("OPERATOR_EMAILS", "ops@example.com");
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });

    await expect(OperatorDepositsPage()).rejects.toThrow("NOT_FOUND");
    expect(listPendingDepositsMock).not.toHaveBeenCalled();
  });
});
