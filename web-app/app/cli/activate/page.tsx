import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { listWorkspacesForUser } from "@/lib/workspaces/workspaces";
import { ActivateForm } from "./activate-form";

interface ActivateCliPageProps {
  searchParams: Promise<{ code?: string }>;
}

export default async function ActivateCliPage({ searchParams }: ActivateCliPageProps) {
  const { code } = await searchParams;
  const userCode = code ?? "";
  const user = await getCurrentUser();
  if (user === null) {
    const returnTo = userCode === "" ? "/cli/activate" : `/cli/activate?code=${userCode}`;
    redirect(signInPath(returnTo));
  }
  const workspaces = await listWorkspacesForUser(user.id);

  return (
    <main>
      <h1>Connect Claude Code</h1>
      <p className="muted">
        Check that the code matches the one in your terminal. Sessions from this machine will be
        shared with the workspace you choose.
      </p>
      {workspaces.length === 0 ? (
        <p>
          You need a workspace first. <Link href="/app">Create a workspace</Link>
        </p>
      ) : (
        <ActivateForm userCode={userCode} workspaces={workspaces} />
      )}
    </main>
  );
}
