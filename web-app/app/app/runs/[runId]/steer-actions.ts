"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/current-user";
import { readFormText } from "@/lib/http/form-data";
import { holdRun, queueSteerMessage, releaseRun } from "@/lib/runs/steering";
import type { SteerActionState } from "./steer-state";

async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  return user;
}

function outcome(accepted: boolean): SteerActionState {
  return accepted ? { status: "done" } : { status: "refused" };
}

// The database decides who may steer or hold (owners and drivers of the run's workspace); the
// page learns about the result through Realtime, like every other viewer.
export async function sendSteerMessageAction(
  _previous: SteerActionState,
  formData: FormData,
): Promise<SteerActionState> {
  const user = await requireUser();
  const body = (readFormText(formData, "body") ?? "").trim();
  if (body === "") {
    return { status: "empty" };
  }
  return outcome(
    await queueSteerMessage({
      runId: readFormText(formData, "runId") ?? "",
      authorId: user.id,
      body,
    }),
  );
}

export async function holdRunAction(
  _previous: SteerActionState,
  formData: FormData,
): Promise<SteerActionState> {
  const user = await requireUser();
  return outcome(
    await holdRun({
      runId: readFormText(formData, "runId") ?? "",
      userId: user.id,
      reason: (readFormText(formData, "reason") ?? "").trim(),
    }),
  );
}

export async function releaseRunAction(
  _previous: SteerActionState,
  formData: FormData,
): Promise<SteerActionState> {
  const user = await requireUser();
  return outcome(
    await releaseRun({ runId: readFormText(formData, "runId") ?? "", userId: user.id }),
  );
}
