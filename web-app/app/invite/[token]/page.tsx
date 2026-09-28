import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { AcceptInviteForm } from "./accept-invite-form";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

// Accepting is a button, not a page load, so link previews and prefetching cannot use the invite.
export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const user = await getCurrentUser();

  return (
    <main>
      <h1>You are invited to a workspace</h1>
      {user === null ? (
        <p>
          <Link className="button" href={signInPath(`/invite/${token}`)}>
            Sign in to accept
          </Link>
        </p>
      ) : (
        <>
          <p className="muted">Signed in as {user.email}. The invite must be for this email.</p>
          <AcceptInviteForm token={token} />
        </>
      )}
    </main>
  );
}
