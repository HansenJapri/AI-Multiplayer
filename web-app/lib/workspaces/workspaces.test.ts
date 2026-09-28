// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createWorkspace,
  listWorkspacesForUser,
  normalizeWorkspaceName,
  WorkspaceStoreError,
} from "./workspaces";

const { rpcMock, fromMock } = vi.hoisted(() => ({ rpcMock: vi.fn(), fromMock: vi.fn() }));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ rpc: rpcMock }),
}));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ from: fromMock }),
}));

function membershipQueryResolving(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => Promise.resolve(result)),
  };
  fromMock.mockReturnValueOnce(query);
  return query;
}

describe("normalizeWorkspaceName", () => {
  it("trims the name", () => {
    expect(normalizeWorkspaceName("  Acme Agency ")).toBe("Acme Agency");
  });

  it.each([null, 7, "", "   ", "x".repeat(101)])("rejects %j", (value) => {
    expect(normalizeWorkspaceName(value)).toBeNull();
  });
});

describe("createWorkspace", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("creates the workspace with the user as owner and returns its id", async () => {
    rpcMock.mockResolvedValueOnce({ data: "workspace-1", error: null });

    expect(await createWorkspace("user-1", "Acme Agency")).toBe("workspace-1");
    expect(rpcMock).toHaveBeenCalledWith("create_workspace_with_owner", {
      p_name: "Acme Agency",
      p_owner_id: "user-1",
    });
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "check" } });

    await expect(createWorkspace("user-1", "Acme")).rejects.toThrow(
      new WorkspaceStoreError("23514"),
    );
  });
});

describe("listWorkspacesForUser", () => {
  afterEach(() => {
    fromMock.mockReset();
  });

  it("lists the user's workspaces with their role, through row level security", async () => {
    const query = membershipQueryResolving({
      data: [
        { id: "workspace-1", name: "Acme Agency", workspace_members: [{ role: "owner" }] },
        { id: "workspace-2", name: "Beta Studio", workspace_members: [{ role: "driver" }] },
      ],
      error: null,
    });

    expect(await listWorkspacesForUser("user-1")).toEqual([
      { id: "workspace-1", name: "Acme Agency", role: "owner" },
      { id: "workspace-2", name: "Beta Studio", role: "driver" },
    ]);
    expect(fromMock).toHaveBeenCalledWith("workspaces");
    expect(query.eq).toHaveBeenCalledWith("workspace_members.user_id", "user-1");
  });

  it("fails with the database error code only", async () => {
    membershipQueryResolving({ data: null, error: { code: "42501", message: "denied" } });

    await expect(listWorkspacesForUser("user-1")).rejects.toThrow(WorkspaceStoreError);
  });
});
