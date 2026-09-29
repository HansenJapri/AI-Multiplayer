"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { readFormText } from "@/lib/http/form-data";
import { postRunComment } from "@/lib/runs/runs";
import type { PostCommentState } from "./comment-state";

export async function postCommentAction(
  _previous: PostCommentState,
  formData: FormData,
): Promise<PostCommentState> {
  const user = await getCurrentUser();
  if (user === null) {
    redirect("/login");
  }
  const body = (readFormText(formData, "body") ?? "").trim();
  if (body === "") {
    return { status: "empty" };
  }
  const stepId = readFormText(formData, "stepId");
  // The database checks that the author may comment on this run, and files a guest's comment
  // under the client audience whatever the form says. New comments reach every open page,
  // including the author's, through Realtime.
  const posted = await postRunComment({
    runId: readFormText(formData, "runId") ?? "",
    authorId: user.id,
    body,
    stepId: stepId === null || stepId === "" ? null : stepId,
    audience: readFormText(formData, "audience") === "client" ? "client" : "team",
  });
  return posted ? { status: "posted" } : { status: "refused" };
}
