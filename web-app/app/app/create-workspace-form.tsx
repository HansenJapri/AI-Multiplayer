"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createWorkspaceAction } from "./actions";
import type { CreateWorkspaceState } from "./workspace-form-state";

const INITIAL_STATE: CreateWorkspaceState = { status: "idle" };

export function CreateWorkspaceForm() {
  const [state, formAction] = useActionState(createWorkspaceAction, INITIAL_STATE);
  return (
    <form action={formAction} className="form">
      <label htmlFor="workspace-name">Workspace name</label>
      <input id="workspace-name" name="name" type="text" maxLength={100} required />
      {state.status === "invalid_name" ? (
        <p role="alert" className="message-error">
          Use 1 to 100 characters.
        </p>
      ) : null}
      <SubmitButton label="Create workspace" pendingLabel="Creating…" />
    </form>
  );
}
