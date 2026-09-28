import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { listWorkspacesForUser } from "@/lib/workspaces/workspaces";
import { CreateWorkspaceForm } from "./create-workspace-form";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath("/app"));
  }
  const workspaces = await listWorkspacesForUser(user.id);

  return (
    <main>
      <h1>Workspaces</h1>
      <p className="muted">Signed in as {user.email}</p>
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
