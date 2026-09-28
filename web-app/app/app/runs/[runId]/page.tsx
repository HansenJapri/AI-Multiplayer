import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { loadRunForViewer } from "@/lib/runs/runs";
import { LiveRun } from "./live-run";

interface RunPageProps {
  params: Promise<{ runId: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { runId } = await params;
  const user = await getCurrentUser();
  if (user === null) {
    redirect(signInPath(`/app/runs/${runId}`));
  }
  const run = await loadRunForViewer(runId, user.id);
  if (run === null) {
    notFound();
  }

  return (
    <main>
      <p className="muted">
        <Link href={`/app/workspaces/${run.workspaceId}`}>{run.workspaceName}</Link>
      </p>
      <h1>Run</h1>
      <p className="muted">
        Claude Code session <code>{run.claudeSessionId}</code> · you are {run.viewerRole}
      </p>
      <LiveRun run={run} viewer={{ id: user.id, email: user.email }} />
    </main>
  );
}
