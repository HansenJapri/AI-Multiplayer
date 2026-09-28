import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { originFromHeaders } from "@/lib/http/request-origin";
import { listRunsForWorkspace } from "@/lib/runs/runs";
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
  const [members, runs] = await Promise.all([
    listWorkspaceMembers(workspaceId),
    listRunsForWorkspace(workspaceId),
  ]);
  const cliPackageUrl = `${originFromHeaders(await headers())}/aim.tgz`;

  return (
    <main>
      <h1>{workspace.name}</h1>

      <h2>Runs</h2>
      {runs.length === 0 ? (
        <p className="muted">No runs yet. Connect Claude Code below and start a session.</p>
      ) : (
        <ul className="list">
          {runs.map((run) => (
            <li key={run.id}>
              <Link className="list-item" href={`/app/runs/${run.id}`}>
                <span>
                  Session <code>{run.claudeSessionId}</code>
                </span>
                <span className="muted">{new Date(run.createdAt).toLocaleString()}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2>Connect Claude Code</h2>
      <div className="card">
        <p>Once per machine, connect it to this workspace:</p>
        <p className="code">npx --yes {cliPackageUrl} login</p>
        <p>Then, inside each project whose sessions you want to share:</p>
        <p className="code">npx --yes {cliPackageUrl} install</p>
        <p className="muted">
          Only projects where you run install are shared. Your model key and subscription stay on
          your machine.
        </p>
      </div>

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
