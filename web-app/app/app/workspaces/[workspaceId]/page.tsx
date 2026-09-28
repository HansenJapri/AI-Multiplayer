import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { listWorkspaceMembers } from "@/lib/workspaces/members";
import { listWorkspacesForUser } from "@/lib/workspaces/workspaces";
import { InviteForm } from "./invite-form";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath(`/app/workspaces/${workspaceId}`));
  }

  const workspace = (await listWorkspacesForUser(user.id)).find(({ id }) => id === workspaceId);
  if (workspace === undefined) {
    notFound();
  }
  const members = await listWorkspaceMembers(workspaceId);

  return (
    <main>
      <h1>{workspace.name}</h1>
      <h2>Members</h2>
      <ul className="list">
        {members.map((member) => (
          <li key={member.userId} className="list-item">
            <span>{member.email}</span>
            <span className="badge">{member.role}</span>
          </li>
        ))}
      </ul>
      <h2>Invite a teammate</h2>
      {workspace.role === "owner" ? (
        <InviteForm workspaceId={workspaceId} />
      ) : (
        <p className="muted">Only owners can invite teammates.</p>
      )}
    </main>
  );
}
