// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { listWorkspaceMembers } from "./members";
import { WorkspaceStoreError } from "./workspaces";

const { fromMock, getUserByIdMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
  getUserByIdMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ from: fromMock }),
}));
vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({ auth: { admin: { getUserById: getUserByIdMock } } }),
}));

function membersQueryResolving(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => Promise.resolve(result)),
  };
  fromMock.mockReturnValueOnce(query);
  return query;
}

describe("listWorkspaceMembers", () => {
  afterEach(() => {
    fromMock.mockReset();
    getUserByIdMock.mockReset();
  });

  it("returns the members visible to the signed-in user with their email and role", async () => {
    const query = membersQueryResolving({
      data: [
        { user_id: "owner-1", role: "owner" },
        { user_id: "driver-1", role: "driver" },
      ],
      error: null,
    });
    getUserByIdMock
      .mockResolvedValueOnce({ data: { user: { email: "owner@agency.example" } }, error: null })
      .mockResolvedValueOnce({ data: { user: { email: "driver@agency.example" } }, error: null });

    expect(await listWorkspaceMembers("workspace-1")).toEqual([
      { userId: "owner-1", email: "owner@agency.example", role: "owner" },
      { userId: "driver-1", email: "driver@agency.example", role: "driver" },
    ]);
    expect(query.eq).toHaveBeenCalledWith("workspace_id", "workspace-1");
  });

  // Row level security returns no rows to a non-member, so no email is ever looked up for them.
  it("returns nothing and looks up no email when the user is not a member", async () => {
    membersQueryResolving({ data: [], error: null });

    expect(await listWorkspaceMembers("workspace-1")).toEqual([]);
    expect(getUserByIdMock).not.toHaveBeenCalled();
  });

  it("shows a placeholder when an account email cannot be read", async () => {
    membersQueryResolving({ data: [{ user_id: "owner-1", role: "owner" }], error: null });
    getUserByIdMock.mockResolvedValueOnce({ data: { user: null }, error: { message: "gone" } });

    expect(await listWorkspaceMembers("workspace-1")).toEqual([
      { userId: "owner-1", email: "unknown account", role: "owner" },
    ]);
  });

  it("fails with the database error code only", async () => {
    membersQueryResolving({ data: null, error: { code: "42501", message: "denied" } });

    await expect(listWorkspaceMembers("workspace-1")).rejects.toThrow(WorkspaceStoreError);
  });
});
