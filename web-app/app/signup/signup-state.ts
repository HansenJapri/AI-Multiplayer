export type SignUpState =
  | { status: "idle" }
  | { status: "check_email"; email: string }
  | { status: "invalid_email" }
  | { status: "weak_password" }
  | { status: "email_taken" }
  | { status: "rate_limited" }
  | { status: "failed" };
