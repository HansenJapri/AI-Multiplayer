"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { approveDeviceLogin } from "@/lib/cli/device-login";
import { readFormText } from "@/lib/http/form-data";
import type { ActivateCliState } from "./activate-state";

export async function approveCliLoginAction(
  _previous: ActivateCliState,
  formData: FormData,
): Promise<ActivateCliState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath("/cli/activate"));
  }
  // The database checks that the user belongs to the chosen workspace.
  const approved = await approveDeviceLogin(
    readFormText(formData, "userCode") ?? "",
    user.id,
    readFormText(formData, "workspaceId") ?? "",
  );
  return approved ? { status: "approved" } : { status: "invalid" };
}
