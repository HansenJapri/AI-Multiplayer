import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  return (
    <main>
      <h1>Sign in</h1>
      <p className="muted">We email you a one-time link. No password needed.</p>
      {error === "link_invalid" ? (
        <p role="alert" className="message-error">
          That sign-in link is invalid or has expired. Request a new one.
        </p>
      ) : null}
      <LoginForm nextPath={next ?? null} />
    </main>
  );
}
