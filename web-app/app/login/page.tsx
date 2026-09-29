import Link from "next/link";
import { withNextPath } from "@/lib/auth/sign-in-path";
import { LoginForm } from "./login-form";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;
  return (
    <main>
      <h1>Sign in</h1>
      <LoginForm nextPath={next ?? null} />
      <p className="muted">
        New here? <Link href={withNextPath("/signup", next ?? null)}>Create an account</Link>
      </p>
    </main>
  );
}
