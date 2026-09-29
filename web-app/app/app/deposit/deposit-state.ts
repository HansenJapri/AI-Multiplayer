export type DepositFormState =
  | { status: "idle" }
  | { status: "instructions"; reference: string; message: string }
  | { status: "invalid_plan" }
  | { status: "invalid_seats" }
  | { status: "not_owner" };
