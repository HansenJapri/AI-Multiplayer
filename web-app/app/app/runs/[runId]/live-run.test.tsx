import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RunForViewer } from "@/lib/runs/runs";
import { LiveRun } from "./live-run";

type Listener = (payload: unknown) => void;

const { channelStub, removeChannelMock, setAuthMock, getSessionMock } = vi.hoisted(() => {
  const listeners: {
    filter: Record<string, unknown>;
    kind: string;
    listener: (payload: unknown) => void;
  }[] = [];
  const stub = {
    listeners,
    presence: {} as Record<string, { email: string }[]>,
    on: vi.fn(
      (kind: string, filter: Record<string, unknown>, listener: (payload: unknown) => void) => {
        listeners.push({ kind, filter, listener });
        return stub;
      },
    ),
    subscribe: vi.fn((callback?: (status: string) => void) => {
      callback?.("SUBSCRIBED");
      return stub;
    }),
    track: vi.fn(() => Promise.resolve("ok")),
    presenceState: vi.fn(() => stub.presence),
  };
  return {
    channelStub: stub,
    removeChannelMock: vi.fn(),
    setAuthMock: vi.fn(() => Promise.resolve()),
    getSessionMock: vi.fn(() =>
      Promise.resolve({ data: { session: { access_token: "user-access-token" } } }),
    ),
  };
});

vi.mock("@/lib/supabase/browser-client", () => ({
  createSupabaseBrowserClient: () => ({
    channel: () => channelStub,
    removeChannel: removeChannelMock,
    auth: { getSession: getSessionMock },
    realtime: { setAuth: setAuthMock },
  }),
}));
vi.mock("./actions", () => ({ postCommentAction: vi.fn() }));

const VIEWER = { id: "user-2", email: "driver@agency.example" };

const RUN: RunForViewer = {
  id: "run-1",
  workspaceId: "workspace-1",
  workspaceName: "Acme Agency",
  claudeSessionId: "session-1",
  viewerRole: "driver",
  steps: [
    {
      id: "event-1",
      receivedAt: "2026-09-28T10:00:01Z",
      kind: "prompt",
      title: "Prompt",
      detail: "Fix the failing test",
    },
    {
      id: "event-2",
      receivedAt: "2026-09-28T10:00:02Z",
      kind: "tool_result",
      title: "Edit done",
      detail: "src/app.ts",
      diff: [
        { sign: "-", text: "old line" },
        { sign: "+", text: "new line" },
      ],
      usage: { model: "claude-sonnet-5", inputTokens: 120, outputTokens: 45 },
    },
  ],
  comments: [
    {
      id: "comment-1",
      stepId: "event-2",
      authorId: "user-1",
      authorEmail: "owner@agency.example",
      body: "Why this change?",
      receivedAt: "2026-09-28T10:00:03Z",
    },
  ],
};

async function renderSubscribed() {
  const view = render(<LiveRun run={RUN} viewer={VIEWER} />);
  await waitFor(() => {
    expect(channelStub.subscribe).toHaveBeenCalled();
  });
  return view;
}

function emit(table: string, row: Record<string, unknown>) {
  const subscription = channelStub.listeners.find(
    ({ kind, filter }) => kind === "postgres_changes" && filter.table === table,
  );
  act(() => {
    (subscription?.listener as Listener)({ new: row });
  });
}

describe("LiveRun", () => {
  afterEach(() => {
    channelStub.listeners.length = 0;
    channelStub.presence = {};
    vi.clearAllMocks();
  });

  it("shows the steps with their diff and token usage, and comments under their step", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} />);

    expect(screen.getByText("Fix the failing test")).toBeInTheDocument();
    expect(screen.getByText("new line")).toHaveClass("diff-added");
    expect(screen.getByText("old line")).toHaveClass("diff-removed");
    expect(screen.getByText("120 in · 45 out tokens")).toBeInTheDocument();
    expect(screen.getByText("Why this change?")).toBeInTheDocument();
  });

  it("subscribes only to this run's new steps and comments", async () => {
    await renderSubscribed();

    const filters = channelStub.listeners
      .filter(({ kind }) => kind === "postgres_changes")
      .map(({ filter }) => filter);
    expect(filters).toEqual([
      { event: "INSERT", schema: "public", table: "hook_events", filter: "run_id=eq.run-1" },
      { event: "INSERT", schema: "public", table: "run_comments", filter: "run_id=eq.run-1" },
    ]);
    expect(channelStub.track).toHaveBeenCalledWith({ email: VIEWER.email });
  });

  // Without the user's token Realtime subscribes as anon, and row level security then delivers
  // no inserts at all (presence still works, which hides the problem).
  it("subscribes with the signed-in user's token so row level security applies", async () => {
    await renderSubscribed();

    expect(setAuthMock).toHaveBeenCalledWith("user-access-token");
    expect(setAuthMock.mock.invocationCallOrder[0]).toBeLessThan(
      channelStub.subscribe.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("appends a step that arrives live", async () => {
    await renderSubscribed();

    emit("hook_events", {
      id: "event-3",
      hook_event_name: "PreToolUse",
      payload: { tool_name: "Bash", tool_input: { command: "npm test" } },
      received_at: "2026-09-28T10:00:04Z",
    });

    expect(screen.getByText("npm test")).toBeInTheDocument();
  });

  it("appends a comment that arrives live, naming the viewer's own comments", async () => {
    await renderSubscribed();

    emit("run_comments", {
      id: "comment-2",
      hook_event_id: null,
      author_id: VIEWER.id,
      body: "On it",
      created_at: "2026-09-28T10:00:05Z",
    });

    expect(screen.getByText("On it")).toBeInTheDocument();
    expect(screen.getAllByText(VIEWER.email).length).toBeGreaterThan(0);
  });

  it("lists who is watching right now", async () => {
    await renderSubscribed();
    channelStub.presence = {
      "user-1": [{ email: "owner@agency.example" }],
      "user-2": [{ email: VIEWER.email }],
    };

    const sync = channelStub.listeners.find(({ kind }) => kind === "presence");
    act(() => {
      (sync?.listener as Listener)({});
    });

    expect(screen.getByRole("list", { name: "Watching now" })).toHaveTextContent(
      "owner@agency.example",
    );
  });

  it("anchors the next comment to the chosen step", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} />);

    const [firstStepCommentButton] = screen.getAllByRole("button", {
      name: "Comment on this step",
    });
    if (firstStepCommentButton === undefined) {
      throw new Error("expected a comment button per step");
    }
    fireEvent.click(firstStepCommentButton);

    expect(screen.getByText("Commenting on: Prompt")).toBeInTheDocument();
    expect(screen.getByDisplayValue("event-1")).toHaveAttribute("name", "stepId");
  });

  it("leaves the channel when the page closes", async () => {
    const { unmount } = await renderSubscribed();

    unmount();

    expect(removeChannelMock).toHaveBeenCalledWith(channelStub);
  });
});
