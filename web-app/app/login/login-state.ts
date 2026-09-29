export type LoginState =
  | { status: "idle" }
  | { status: "invalid_email" }
  | { status: "invalid_credentials" }
  | { status: "rate_limited" }
  | { status: "failed" };
