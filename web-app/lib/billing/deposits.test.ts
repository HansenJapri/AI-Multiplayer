// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import type { DepositProvider } from "./deposit-provider";
import {
  completeDeposit,
  DepositStoreError,
  listDepositsForUser,
  listPendingDeposits,
  startDeposit,
} from "./deposits";

const { rpcMock, fromMock, adminFromMock, getUserByIdMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
  adminFromMock: vi.fn(),
  getUserByIdMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({
    rpc: rpcMock,
    from: adminFromMock,
    auth: { admin: { getUserById: getUserByIdMock } },
  }),
}));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ from: fromMock }),
}));

function queryResolving(target: typeof fromMock, result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => Promise.resolve(result)),
  };
  target.mockReturnValueOnce(query);
  return query;
}

const startCheckoutMock = vi.fn(() =>
  Promise.resolve({ kind: "redirect" as const, url: "https://pay.example/c/1" }),
);
const fakeProvider: DepositProvider = { name: "fake_pay", startCheckout: startCheckoutMock };

const REQUEST = {
  workspaceId: "workspace-1",
  userId: "owner-1",
  customerEmail: "owner@agency.example",
  plan: "team" as const,
  seats: 2,
  origin: "https://ai-multiplayer.vercel.app",
};

describe("startDeposit", () => {
  afterEach(() => {
    rpcMock.mockReset();
    startCheckoutMock.mockClear();
  });

  it("records the deposit at the server's price, then starts checkout with the provider", async () => {
    rpcMock.mockResolvedValueOnce({ data: "deposit-1", error: null });

    const result = await startDeposit(REQUEST, fakeProvider);

    expect(rpcMock).toHaveBeenCalledWith("start_deposit", {
      p_workspace_id: "workspace-1",
      p_user_id: "owner-1",
      p_plan: "team",
      p_seats: 2,
      p_amount_cents: 6000,
      p_currency: "USD",
      p_provider: "fake_pay",
    });
    expect(startCheckoutMock).toHaveBeenCalledWith({
      depositId: "deposit-1",
      plan: "team",
      seats: 2,
      amountCents: 6000,
      currency: "USD",
      customerEmail: "owner@agency.example",
      returnUrl: "https://ai-multiplayer.vercel.app/app/deposit",
    });
    expect(result).toEqual({
      status: "started",
      checkout: { kind: "redirect", url: "https://pay.example/c/1" },
    });
  });

  it("refuses an invalid seat count before touching the database", async () => {
    expect(await startDeposit({ ...REQUEST, seats: 0 }, fakeProvider)).toEqual({
      status: "invalid_seats",
    });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("reports that only owners can place a deposit", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await startDeposit(REQUEST, fakeProvider)).toEqual({ status: "not_owner" });
    expect(startCheckoutMock).not.toHaveBeenCalled();
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "check" } });

    await expect(startDeposit(REQUEST, fakeProvider)).rejects.toThrow(DepositStoreError);
  });
});

describe("completeDeposit", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("marks the deposit paid with the provider reference", async () => {
    rpcMock.mockResolvedValueOnce({ data: true, error: null });

    expect(await completeDeposit("deposit-1", "wire 42")).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("complete_deposit", {
      p_deposit_id: "deposit-1",
      p_provider_reference: "wire 42",
    });
  });
});

describe("listDepositsForUser", () => {
  afterEach(() => {
    fromMock.mockReset();
  });

  it("lists the deposits of the user's workspaces through their own session", async () => {
    queryResolving(fromMock, {
      data: [
        {
          id: "abcdef12-0000-0000-0000-000000000000",
          plan: "agency",
          seats: 1,
          amount_cents: 19900,
          currency: "USD",
          status: "pending",
          created_at: "2026-09-29T10:00:00Z",
          workspace: { name: "Acme Agency" },
        },
      ],
      error: null,
    });

    expect(await listDepositsForUser()).toEqual([
      {
        id: "abcdef12-0000-0000-0000-000000000000",
        reference: "DEP-ABCDEF12",
        workspaceName: "Acme Agency",
        plan: "agency",
        seats: 1,
        amountCents: 19900,
        currency: "USD",
        status: "pending",
        createdAt: "2026-09-29T10:00:00Z",
      },
    ]);
    expect(fromMock).toHaveBeenCalledWith("deposits");
  });
});

describe("listPendingDeposits", () => {
  afterEach(() => {
    adminFromMock.mockReset();
    getUserByIdMock.mockReset();
  });

  it("lists every pending deposit with the email of the owner who placed it", async () => {
    const query = queryResolving(adminFromMock, {
      data: [
        {
          id: "abcdef12-0000-0000-0000-000000000000",
          plan: "team",
          seats: 2,
          amount_cents: 6000,
          currency: "USD",
          status: "pending",
          created_at: "2026-09-29T10:00:00Z",
          started_by: "owner-1",
          workspace: { name: "Acme Agency" },
        },
      ],
      error: null,
    });
    getUserByIdMock.mockResolvedValueOnce({ data: { user: { email: "owner@agency.example" } } });

    const deposits = await listPendingDeposits();

    expect(query.eq).toHaveBeenCalledWith("status", "pending");
    expect(deposits).toEqual([
      expect.objectContaining({
        reference: "DEP-ABCDEF12",
        workspaceName: "Acme Agency",
        amountCents: 6000,
        ownerEmail: "owner@agency.example",
      }),
    ]);
  });
});
