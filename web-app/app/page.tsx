import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>AI Multiplayer</h1>
      <p>
        Every agent session your team runs — watchable, steerable, and handed off with its
        reasoning, even to your clients.
      </p>
      <p className="muted">
        Works with Claude Code on each teammate&apos;s own machine and subscription. We never store
        your model keys and never judge the agent&apos;s output.
      </p>
      <p>
        <Link className="button" href="/login">
          Sign in
        </Link>
      </p>
    </main>
  );
}
