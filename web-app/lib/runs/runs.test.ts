// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { listRunsForWorkspace, loadRunForViewer, postRunComment, RunStoreError } from "./runs";

const { rpcMock, fromMock, getUserByIdMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
  getUserByIdMock: vi.fn(),
}));

vi.mock("@/lib/supabase/admin-client", () => ({
  createSupabaseAdminClient: () => ({
    rpc: rpcMock,
    auth: { admin: { getUserById: getUserByIdMock } },
  }),
}));
vi.mock("@/lib/supabase/server-client", () => ({
  createSupabaseServerClient: () => Promise.resolve({ from: fromMock }),
}));

function queryResolving(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    order: vi.fn(() => query),
    is: vi.fn(() => query),
    single: vi.fn(() => Promise.resolve(result)),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
    then: (resolve: (value: unknown) => unknown) => Promise.resolve(result).then(resolve),
  };
  fromMock.mockReturnValueOnce(query);
  return query;
}

describe("listRunsForWorkspace", () => {
  afterEach(() => {
    fromMock.mockReset();
  });

  it("lists the workspace runs newest first through the user's session", async () => {
    const query = queryResolving({
      data: [{ id: "run-2", claude_session_id: "s2", created_at: "2026-09-28T11:00:00Z" }],
      error: null,
    });

    expect(await listRunsForWorkspace("workspace-1")).toEqual([
      { id: "run-2", claudeSessionId: "s2", createdAt: "2026-09-28T11:00:00Z" },
    ]);
    expect(fromMock).toHaveBeenCalledWith("runs");
    expect(query.eq).toHaveBeenCalledWith("workspace_id", "workspace-1");
    expect(query.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });
});

describe("loadRunForViewer", () => {
  afterEach(() => {
    rpcMock.mockReset();
    fromMock.mockReset();
    getUserByIdMock.mockReset();
  });

  it("returns nothing for someone who may not see the run", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await loadRunForViewer("run-1", "outsider")).toBeNull();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("records the view and loads the run, its timeline steps and its comments", async () => {
    rpcMock.mockResolvedValueOnce({ data: "driver", error: null });
    queryResolving({
      data: {
        id: "run-1",
        workspace_id: "workspace-1",
        claude_session_id: "s1",
        created_at: "2026-09-28T10:00:00Z",
        workspace: { name: "Acme Agency" },
      },
      error: null,
    });
    queryResolving({
      data: [
        {
          id: "event-1",
          hook_event_name: "UserPromptSubmit",
          payload: { prompt: "Fix it" },
          received_at: "2026-09-28T10:00:01Z",
        },
      ],
      error: null,
    });
    queryResolving({
      data: [
        {
          id: "comment-1",
          hook_event_id: "event-1",
          author_id: "user-1",
          body: "Looks right",
          created_at: "2026-09-28T10:00:02Z",
        },
      ],
      error: null,
    });
    queryResolving({
      data: [
        {
          id: "steer-1",
          author_id: "user-1",
          body: "Use the helper",
          created_at: "2026-09-28T10:00:04Z",
          delivered_at: null,
        },
      ],
      error: null,
    });
    queryResolving({ data: { raised_by: "user-1", reason: "Reviewing" }, error: null });
    queryResolving({
      data: [
        { sequence: 1, created_at: "2026-09-28T10:00:05Z", uploaded_at: "2026-09-28T10:00:07Z" },
        { sequence: 2, created_at: "2026-09-28T10:01:05Z", uploaded_at: null },
      ],
      error: null,
    });
    getUserByIdMock.mockResolvedValue({ data: { user: { email: "owner@agency.example" } } });

    const run = await loadRunForViewer("run-1", "user-2");

    expect(rpcMock).toHaveBeenCalledWith("record_run_view", {
      p_run_id: "run-1",
      p_user_id: "user-2",
    });
    expect(run).toEqual({
      id: "run-1",
      workspaceId: "workspace-1",
      workspaceName: "Acme Agency",
      claudeSessionId: "s1",
      viewerRole: "driver",
      steps: [
        {
          id: "event-1",
          receivedAt: "2026-09-28T10:00:01Z",
          kind: "prompt",
          title: "Prompt",
          detail: "Fix it",
        },
      ],
      comments: [
        {
          id: "comment-1",
          stepId: "event-1",
          authorId: "user-1",
          authorEmail: "owner@agency.example",
          body: "Looks right",
          receivedAt: "2026-09-28T10:00:02Z",
        },
      ],
      steerMessages: [
        {
          id: "steer-1",
          authorId: "user-1",
          authorEmail: "owner@agency.example",
          body: "Use the helper",
          receivedAt: "2026-09-28T10:00:04Z",
          deliveredAt: null,
        },
      ],
      hold: { raisedByEmail: "owner@agency.example", reason: "Reviewing" },
      checkpoints: [
        { step: 1, receivedAt: "2026-09-28T10:00:05Z", ready: true },
        { step: 2, receivedAt: "2026-09-28T10:01:05Z", ready: false },
      ],
    });
  });
});

describe("postRunComment", () => {
  afterEach(() => {
    rpcMock.mockReset();
  });

  it("posts the comment through post_run_comment", async () => {
    rpcMock.mockResolvedValueOnce({ data: "comment-1", error: null });

    expect(
      await postRunComment({ runId: "run-1", authorId: "user-1", body: "Hi", stepId: null }),
    ).toBe(true);
    expect(rpcMock).toHaveBeenCalledWith("post_run_comment", {
      p_run_id: "run-1",
      p_author_id: "user-1",
      p_body: "Hi",
      p_hook_event_id: null,
    });
  });

  it("reports a refused comment", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: null });

    expect(await postRunComment({ runId: "r", authorId: "u", body: "Hi", stepId: null })).toBe(
      false,
    );
  });

  it("fails with the database error code only", async () => {
    rpcMock.mockResolvedValueOnce({ data: null, error: { code: "23514", message: "check" } });

    await expect(
      postRunComment({ runId: "r", authorId: "u", body: "", stepId: null }),
    ).rejects.toThrow(RunStoreError);
  });
});
