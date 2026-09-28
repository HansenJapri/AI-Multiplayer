import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { WorkspaceStoreError, type WorkspaceRole } from "./workspaces";

const UNKNOWN_ACCOUNT_EMAIL = "unknown account";

export interface WorkspaceMember {
  userId: string;
  email: string;
  role: WorkspaceRole;
}

async function readAccountEmail(userId: string): Promise<string> {
  const { data } = await createSupabaseAdminClient().auth.admin.getUserById(userId);
  return data.user?.email ?? UNKNOWN_ACCOUNT_EMAIL;
}

// Membership is read through the user's session first, so row level security decides whose
// emails are looked up; the service role only resolves emails for rows the user may already see.
export async function listWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = await createSupabaseServerClient();
  const { data: memberships, error } = await supabase
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId)
    .order("created_at");
  if (error) {
    throw new WorkspaceStoreError(error.code);
  }
  return Promise.all(
    memberships.map(async ({ user_id: userId, role }) => ({
      userId,
      email: await readAccountEmail(userId),
      role: role as WorkspaceRole,
    })),
  );
}
