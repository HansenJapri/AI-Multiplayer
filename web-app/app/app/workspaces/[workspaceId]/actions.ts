"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { parseEmailAddress } from "@/lib/auth/email";
import { readFormText } from "@/lib/http/form-data";
import { originFromHeaders } from "@/lib/http/request-origin";
import { createTeamInvite } from "@/lib/workspaces/invites";
import type { InviteTeammateState } from "./invite-form-state";

export async function inviteTeammateAction(
  _previous: InviteTeammateState,
  formData: FormData,
): Promise<InviteTeammateState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  const email = parseEmailAddress(readFormText(formData, "email"));
  if (email === null) {
    return { status: "invalid_email" };
  }

  const result = await createTeamInvite({
    workspaceId: readFormText(formData, "workspaceId") ?? "",
    inviterId: user.id,
    email,
    origin: originFromHeaders(await headers()),
  });
  return result.status === "created"
    ? { status: "created", email, inviteUrl: result.inviteUrl }
    : { status: "not_owner" };
}
