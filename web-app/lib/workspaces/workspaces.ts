import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

const MAX_WORKSPACE_NAME_LENGTH = 100;

export type WorkspaceRole = "owner" | "driver";

export interface WorkspaceSummary {
  id: string;
  name: string;
  role: WorkspaceRole;
}

// Carries only the Postgres error code: PostgREST details can quote row values.
export class WorkspaceStoreError extends Error {
  override readonly name = "WorkspaceStoreError";

  constructor(readonly databaseErrorCode: string) {
    super(`Workspace storage failed (database error ${databaseErrorCode})`);
  }
}

export function normalizeWorkspaceName(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const name = value.trim();
  return name.length > 0 && name.length <= MAX_WORKSPACE_NAME_LENGTH ? name : null;
}

export async function createWorkspace(ownerId: string, name: string): Promise<string> {
  const { data: workspaceId, error } = await createSupabaseAdminClient().rpc(
    "create_workspace_with_owner",
    { p_name: name, p_owner_id: ownerId },
  );
  if (error) {
    throw new WorkspaceStoreError(error.code);
  }
  return workspaceId;
}

// Reads through the user's own session, so row level security decides what is visible.
export async function listWorkspacesForUser(userId: string): Promise<WorkspaceSummary[]> {
  const supabase = await createSupabaseServerClient();
  const { data: workspaces, error } = await supabase
    .from("workspaces")
    .select("id, name, workspace_members!inner(role)")
    .eq("workspace_members.user_id", userId)
    .order("created_at");
  if (error) {
    throw new WorkspaceStoreError(error.code);
  }
  // The inner join is filtered to this user, so each workspace carries exactly one membership.
  return workspaces.flatMap(({ id, name, workspace_members: [membership] }) =>
    membership === undefined ? [] : [{ id, name, role: membership.role as WorkspaceRole }],
  );
}
