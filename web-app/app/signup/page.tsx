import Link from "next/link";
import { withNextPath } from "@/lib/auth/sign-in-path";
import { SignUpForm } from "./signup-form";

interface SignUpPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { next } = await searchParams;
  return (
    <main>
      <h1>Create an account</h1>
      <SignUpForm nextPath={next ?? null} />
      <p className="muted">
        Already have an account? <Link href={withNextPath("/login", next ?? null)}>Sign in</Link>
      </p>
    </main>
  );
}
