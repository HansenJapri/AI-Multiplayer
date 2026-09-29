import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { listRunsSharedWithGuest } from "@/lib/runs/guests";
import { listWorkspacesForUser } from "@/lib/workspaces/workspaces";
import { CreateWorkspaceForm } from "./create-workspace-form";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath("/app"));
  }
  const [workspaces, sharedRuns] = await Promise.all([
    listWorkspacesForUser(user.id),
    listRunsSharedWithGuest(user.id),
  ]);

  return (
    <main>
      <h1>Workspaces</h1>
      <p className="muted">Signed in as {user.email}</p>
      {sharedRuns.length === 0 ? null : (
        <>
          <h2>Shared with you</h2>
          <ul className="list">
            {sharedRuns.map((shared) => (
              <li key={shared.runId}>
                <Link className="list-item" href={`/app/runs/${shared.runId}`}>
                  <span>
                    {shared.workspaceName} · run <code>{shared.claudeSessionId.slice(0, 8)}</code>
                  </span>
                  <span className="badge">guest</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {workspaces.length === 0 ? (
        <p>Create your first workspace to start sharing runs.</p>
      ) : (
        <ul className="list">
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <Link className="list-item" href={`/app/workspaces/${workspace.id}`}>
                <span>{workspace.name}</span>
                <span className="badge">{workspace.role}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h2>New workspace</h2>
      <CreateWorkspaceForm />
    </main>
  );
}
