"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import type { WorkspaceSummary } from "@/lib/workspaces/workspaces";
import { approveCliLoginAction } from "./actions";
import type { ActivateCliState } from "./activate-state";

const INITIAL_STATE: ActivateCliState = { status: "idle" };

export function ActivateForm({
  userCode,
  workspaces,
}: {
  userCode: string;
  workspaces: WorkspaceSummary[];
}) {
  const [state, formAction] = useActionState(approveCliLoginAction, INITIAL_STATE);

  if (state.status === "approved") {
    return (
      <p role="status" className="message-success">
        This machine is connected. Return to your terminal.
      </p>
    );
  }

  return (
    <form action={formAction} className="form">
      <label htmlFor="user-code">Code shown in your terminal</label>
      <input
        id="user-code"
        name="userCode"
        type="text"
        defaultValue={userCode}
        autoComplete="off"
        required
      />
      <label htmlFor="workspace-id">Workspace</label>
      <select id="workspace-id" name="workspaceId" required>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
      {state.status === "invalid" ? (
        <p role="alert" className="message-error">
          That code is wrong, expired or already used. Run `aim login` again for a new one.
        </p>
      ) : null}
      <SubmitButton label="Connect this machine" pendingLabel="Connecting…" />
    </form>
  );
}
