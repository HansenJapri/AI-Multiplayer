"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { completeDeposit } from "@/lib/billing/deposits";
import { isOperatorEmail } from "@/lib/billing/operators";
import { readFormText } from "@/lib/http/form-data";

const MANUAL_REFERENCE = "manual";

// Operators confirm by hand that the money for a manual deposit arrived.
export async function markDepositPaidAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (user === null || !isOperatorEmail(user.email)) {
    notFound();
  }
  const reference = (readFormText(formData, "reference") ?? "").trim();
  await completeDeposit(
    readFormText(formData, "depositId") ?? "",
    reference === "" ? MANUAL_REFERENCE : reference,
  );
  revalidatePath("/app/ops/deposits");
}
