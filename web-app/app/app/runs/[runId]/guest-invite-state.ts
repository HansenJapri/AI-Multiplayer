export type GuestInviteState =
  | { status: "idle" }
  | { status: "created"; email: string; inviteUrl: string }
  | { status: "invalid_email" }
  | { status: "refused" };
