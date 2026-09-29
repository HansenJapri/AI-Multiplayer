import Link from "next/link";

export default function SignedInLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/app">
          AI Multiplayer
        </Link>
        <nav className="topbar-links">
          <Link href="/pricing">Pricing</Link>
          <form action="/auth/sign-out" method="post">
            <button className="button button-quiet" type="submit">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      {children}
    </>
  );
}
