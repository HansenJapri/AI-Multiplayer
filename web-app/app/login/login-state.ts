export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "invalid_email" }
  | { status: "rate_limited" }
  | { status: "failed" };
