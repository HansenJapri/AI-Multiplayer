"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { readFormText } from "@/lib/http/form-data";
import { acceptRunGuestInvite } from "@/lib/runs/guests";
import type { AcceptGuestInviteState } from "./accept-guest-state";

export async function acceptGuestInviteAction(
  _previous: AcceptGuestInviteState,
  formData: FormData,
): Promise<AcceptGuestInviteState> {
  const token = readFormText(formData, "token") ?? "";
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath(`/guest/${token}`));
  }

  const result = await acceptRunGuestInvite({ token, userId: user.id, email: user.email });
  if (result.status === "invalid") {
    return { status: "invalid" };
  }
  redirect(`/app/runs/${result.runId}`);
}
