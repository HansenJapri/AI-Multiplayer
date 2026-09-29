import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import DepositPage from "./page";

const { getCurrentUserMock, listWorkspacesForUserMock, listDepositsForUserMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    listWorkspacesForUserMock: vi.fn(),
    listDepositsForUserMock: vi.fn(),
  }),
);

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", () => ({
  listWorkspacesForUser: listWorkspacesForUserMock,
}));
vi.mock("@/lib/billing/deposits", () => ({ listDepositsForUser: listDepositsForUserMock }));
vi.mock("./actions", () => ({ startDepositAction: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function pageProps(plan?: string) {
  return { searchParams: Promise.resolve(plan === undefined ? {} : { plan }) };
}

describe("DepositPage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listWorkspacesForUserMock.mockReset();
    listDepositsForUserMock.mockReset();
  });

  it("offers a deposit for the workspaces the user owns, on the plan they picked", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([
      { id: "workspace-1", name: "Acme Agency", role: "owner" },
      { id: "workspace-2", name: "Beta Studio", role: "driver" },
    ]);
    listDepositsForUserMock.mockResolvedValueOnce([]);

    render(await DepositPage(pageProps("agency")));

    const workspace = screen.getByRole("combobox", { name: "Workspace" });
    expect(workspace).toHaveTextContent("Acme Agency");
    expect(workspace).not.toHaveTextContent("Beta Studio");
    expect(screen.getByRole("radio", { name: /Agency/ })).toBeChecked();
    expect(screen.getByText(/\$199/, { selector: "strong" })).toBeInTheDocument();
  });

  it("lists the deposits already placed with their reference and status", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "owner-1", email: "owner@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([
      { id: "workspace-1", name: "Acme Agency", role: "owner" },
    ]);
    listDepositsForUserMock.mockResolvedValueOnce([
      {
        id: "deposit-1",
        reference: "DEP-ABCDEF12",
        workspaceName: "Acme Agency",
        plan: "team",
        seats: 3,
        amountCents: 9000,
        currency: "USD",
        status: "paid",
        createdAt: "2026-09-29T10:00:00Z",
      },
    ]);

    render(await DepositPage(pageProps()));

    const placed = screen.getByRole("list", { name: "Your deposits" });
    expect(placed).toHaveTextContent("DEP-ABCDEF12");
    expect(placed).toHaveTextContent("Team · 3 drivers");
    expect(placed).toHaveTextContent("$90");
    expect(placed).toHaveTextContent("paid");
  });

  it("asks a user who owns no workspace to create one first", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([
      { id: "workspace-2", name: "Beta Studio", role: "driver" },
    ]);
    listDepositsForUserMock.mockResolvedValueOnce([]);

    render(await DepositPage(pageProps("team")));

    expect(screen.getByText(/Only a workspace owner can place a deposit/)).toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Workspace" })).not.toBeInTheDocument();
  });

  it("sends a signed-out visitor to login and back to the chosen plan", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(DepositPage(pageProps("team"))).rejects.toThrow(
      "REDIRECT /login?next=%2Fapp%2Fdeposit%3Fplan%3Dteam",
    );
  });
});
