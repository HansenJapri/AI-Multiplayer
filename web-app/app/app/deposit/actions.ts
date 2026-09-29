"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { startDeposit } from "@/lib/billing/deposits";
import { parsePaidPlan } from "@/lib/billing/plans";
import { readFormText } from "@/lib/http/form-data";
import { originFromHeaders } from "@/lib/http/request-origin";
import type { DepositFormState } from "./deposit-state";

export async function startDepositAction(
  _previous: DepositFormState,
  formData: FormData,
): Promise<DepositFormState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath("/app/deposit"));
  }
  const plan = parsePaidPlan(readFormText(formData, "plan"));
  if (plan === null) {
    return { status: "invalid_plan" };
  }

  // The database checks ownership; the price list checks the seat count.
  const result = await startDeposit({
    workspaceId: readFormText(formData, "workspaceId") ?? "",
    userId: user.id,
    customerEmail: user.email,
    plan,
    seats: Number(readFormText(formData, "seats") ?? "1"),
    origin: originFromHeaders(await headers()),
  });
  if (result.status !== "started") {
    return { status: result.status };
  }
  // Lists the new deposit under "Your deposits" while the form shows the next step.
  revalidatePath("/app/deposit");
  if (result.checkout.kind === "redirect") {
    redirect(result.checkout.url);
  }
  return {
    status: "instructions",
    reference: result.checkout.reference,
    message: result.checkout.message,
  };
}
