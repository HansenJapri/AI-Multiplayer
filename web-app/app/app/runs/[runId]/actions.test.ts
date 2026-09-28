// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { postCommentAction } from "./actions";

const { getCurrentUserMock, postRunCommentMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  postRunCommentMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/runs/runs", () => ({ postRunComment: postRunCommentMock }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function commentForm(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("postCommentAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    postRunCommentMock.mockReset();
  });

  it("posts the comment anchored to the chosen step", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    postRunCommentMock.mockResolvedValueOnce(true);

    const state = await postCommentAction(
      { status: "idle" },
      commentForm({ runId: "run-1", body: "  Why?  ", stepId: "event-1" }),
    );

    expect(state).toEqual({ status: "posted" });
    expect(postRunCommentMock).toHaveBeenCalledWith({
      runId: "run-1",
      authorId: "user-1",
      body: "Why?",
      stepId: "event-1",
    });
  });

  it("posts a comment on the whole run when no step is chosen", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    postRunCommentMock.mockResolvedValueOnce(true);

    await postCommentAction(
      { status: "idle" },
      commentForm({ runId: "run-1", body: "Hi", stepId: "" }),
    );

    expect(postRunCommentMock).toHaveBeenCalledWith(expect.objectContaining({ stepId: null }));
  });

  it("rejects an empty comment without contacting the database", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });

    const state = await postCommentAction(
      { status: "idle" },
      commentForm({ runId: "run-1", body: "   " }),
    );

    expect(state).toEqual({ status: "empty" });
    expect(postRunCommentMock).not.toHaveBeenCalled();
  });

  it("reports a comment the database refused", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    postRunCommentMock.mockResolvedValueOnce(false);

    const state = await postCommentAction(
      { status: "idle" },
      commentForm({ runId: "r", body: "Hi" }),
    );

    expect(state).toEqual({ status: "refused" });
  });
});
