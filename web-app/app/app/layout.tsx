import Link from "next/link";

export default function SignedInLayout({ children }: LayoutProps<"/app">) {
  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/app">
          AI Multiplayer
        </Link>
        <form action="/auth/sign-out" method="post">
          <button className="button button-quiet" type="submit">
            Sign out
          </button>
        </form>
      </header>
      {children}
    </>
  );
}
