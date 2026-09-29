import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { signInPath } from "@/lib/auth/sign-in-path";
import { AcceptGuestForm } from "./accept-guest-form";

interface GuestInvitePageProps {
  params: Promise<{ token: string }>;
}

// Accepting is a button, not a page load, so link previews and prefetching cannot use the invite.
export default async function GuestInvitePage({ params }: GuestInvitePageProps) {
  const { token } = await params;
  const user = await getCurrentUser();

  return (
    <main>
      <h1>You are invited to follow a run</h1>
      <p>
        Your agency shared one of its AI coding runs with you. You can follow the agent as it works,
        read the notes the team shares with you, and comment. You only see this run.
      </p>
      {user === null ? (
        <p>
          <Link className="button" href={signInPath(`/guest/${token}`)}>
            Sign in to open the run
          </Link>
        </p>
      ) : (
        <>
          <p className="muted">Signed in as {user.email}. The link must be for this email.</p>
          <AcceptGuestForm token={token} />
        </>
      )}
    </main>
  );
}
