"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { parseEmailAddress } from "@/lib/auth/email";
import { readFormText } from "@/lib/http/form-data";
import { originFromHeaders } from "@/lib/http/request-origin";
import { createRunGuestInvite } from "@/lib/runs/guests";
import type { GuestInviteState } from "./guest-invite-state";

export async function inviteGuestAction(
  _previous: GuestInviteState,
  formData: FormData,
): Promise<GuestInviteState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  const email = parseEmailAddress(readFormText(formData, "email"));
  if (email === null) {
    return { status: "invalid_email" };
  }

  // The database checks that the inviter is an owner or driver of the run's workspace.
  const result = await createRunGuestInvite({
    runId: readFormText(formData, "runId") ?? "",
    inviterId: user.id,
    email,
    origin: originFromHeaders(await headers()),
  });
  return result.status === "created"
    ? { status: "created", email, inviteUrl: result.inviteUrl }
    : { status: "refused" };
}
