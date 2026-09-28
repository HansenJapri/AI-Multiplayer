export type InviteTeammateState =
  | { status: "idle" }
  | { status: "created"; email: string; inviteUrl: string }
  | { status: "invalid_email" }
  | { status: "not_owner" };
