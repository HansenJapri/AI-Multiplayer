"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { readFormText } from "@/lib/http/form-data";
import { acceptTeamInvite } from "@/lib/workspaces/invites";
import type { AcceptInviteState } from "./accept-invite-state";

export async function acceptInviteAction(
  _previous: AcceptInviteState,
  formData: FormData,
): Promise<AcceptInviteState> {
  const token = readFormText(formData, "token") ?? "";
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath(`/invite/${token}`));
  }

  const result = await acceptTeamInvite({ token, userId: user.id, email: user.email });
  if (result.status === "invalid") {
    return { status: "invalid" };
  }
  redirect(`/app/workspaces/${result.workspaceId}`);
}
