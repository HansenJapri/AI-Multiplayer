"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { readFormText } from "@/lib/http/form-data";
import { createWorkspace, normalizeWorkspaceName } from "@/lib/workspaces/workspaces";
import type { CreateWorkspaceState } from "./workspace-form-state";

export async function createWorkspaceAction(
  _previous: CreateWorkspaceState,
  formData: FormData,
): Promise<CreateWorkspaceState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  const name = normalizeWorkspaceName(readFormText(formData, "name"));
  if (name === null) {
    return { status: "invalid_name" };
  }
  const workspaceId = await createWorkspace(user.id, name);
  redirect(`/app/workspaces/${workspaceId}`);
}
