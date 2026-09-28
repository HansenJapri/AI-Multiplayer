export type PostCommentState =
  { status: "idle" } | { status: "posted" } | { status: "empty" } | { status: "refused" };
