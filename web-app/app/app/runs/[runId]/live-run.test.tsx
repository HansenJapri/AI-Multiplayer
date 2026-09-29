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
vi.mock("./guest-actions", () => ({ inviteGuestAction: vi.fn() }));
vi.mock("./steer-actions", () => ({
  sendSteerMessageAction: vi.fn(),
  holdRunAction: vi.fn(),
  releaseRunAction: vi.fn(),
}));

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
      audience: "team",
    },
    {
      id: "comment-client",
      stepId: null,
      authorId: "user-1",
      authorEmail: "owner@agency.example",
      body: "The preview is ready for you",
      receivedAt: "2026-09-28T10:00:04Z",
      audience: "client",
    },
  ],
  steerMessages: [
    {
      id: "steer-1",
      authorId: "user-1",
      authorEmail: "owner@agency.example",
      body: "Use the existing helper",
      receivedAt: "2026-09-28T10:00:04Z",
      deliveredAt: "2026-09-28T10:00:06Z",
    },
    {
      id: "steer-2",
      authorId: "user-2",
      authorEmail: "driver@agency.example",
      body: "Then run the tests",
      receivedAt: "2026-09-28T10:00:07Z",
      deliveredAt: null,
    },
  ],
  hold: null,
  checkpoints: [
    { step: 1, receivedAt: "2026-09-28T10:00:05Z", ready: true },
    { step: 2, receivedAt: "2026-09-28T10:01:05Z", ready: false },
  ],
  guests: [{ userId: "client-1", email: "buyer@client.example" }],
};

const GUEST_RUN: RunForViewer = {
  ...RUN,
  viewerRole: "guest",
  comments: RUN.comments.filter(({ audience }) => audience === "client"),
  steerMessages: [],
  checkpoints: [],
  guests: [],
};

const CLI_PACKAGE_URL = "https://ai-multiplayer.vercel.app/aim.tgz";

async function renderSubscribed() {
  const view = render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);
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
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

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
      { event: "*", schema: "public", table: "steer_messages", filter: "run_id=eq.run-1" },
      { event: "*", schema: "public", table: "run_holds", filter: "run_id=eq.run-1" },
      { event: "*", schema: "public", table: "run_checkpoints", filter: "run_id=eq.run-1" },
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
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

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

  it("shows each steer message and whether the agent received it", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    expect(screen.getByText("Use the existing helper").closest("li")).toHaveTextContent(
      "delivered",
    );
    expect(screen.getByText("Then run the tests").closest("li")).toHaveTextContent("queued");
    expect(screen.getByRole("textbox", { name: "Message to the agent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hold the run" })).toBeInTheDocument();
  });

  it("shows who holds the run and offers to release it", () => {
    render(
      <LiveRun
        run={{ ...RUN, hold: { raisedByEmail: "owner@agency.example", reason: "Reviewing" } }}
        viewer={VIEWER}
        cliPackageUrl={CLI_PACKAGE_URL}
      />,
    );

    expect(screen.getByRole("status", { name: "Run held" })).toHaveTextContent(
      "Held by owner@agency.example: Reviewing",
    );
    expect(screen.getByRole("button", { name: "Release the run" })).toBeInTheDocument();
  });

  it("updates the hold and message delivery live", async () => {
    await renderSubscribed();

    emit("run_holds", { raised_by: "user-2", reason: "Stop please", released_at: null });
    expect(screen.getByRole("status", { name: "Run held" })).toHaveTextContent(
      "Held by driver@agency.example: Stop please",
    );

    emit("run_holds", {
      raised_by: "user-2",
      reason: "Stop please",
      released_at: "2026-09-28T10:01:00Z",
    });
    expect(screen.queryByRole("status", { name: "Run held" })).not.toBeInTheDocument();

    emit("steer_messages", {
      id: "steer-2",
      author_id: "user-2",
      body: "Then run the tests",
      created_at: "2026-09-28T10:00:07Z",
      delivered_at: "2026-09-28T10:00:09Z",
    });
    expect(screen.getByText("Then run the tests").closest("li")).toHaveTextContent("delivered");
  });

  it("labels the comments the client can read", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    expect(screen.getByText("The preview is ready for you").closest(".comment")).toHaveTextContent(
      "Visible to client",
    );
    expect(screen.getByText("Why this change?").closest(".comment")).not.toHaveTextContent(
      "Visible to client",
    );
  });

  it("lets a member share a comment with the client, internal by default", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    const share = screen.getByRole("checkbox", { name: "Visible to the client" });
    expect(share).not.toBeChecked();
    expect(share).toHaveAttribute("name", "audience");
    expect(share).toHaveAttribute("value", "client");
  });

  it("shows members which clients can open the run and how to invite one", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    const clientAccess = screen.getByRole("region", { name: "Client access" });
    expect(clientAccess).toHaveTextContent("buyer@client.example");
    expect(screen.getByRole("textbox", { name: "Client email" })).toBeInTheDocument();
  });

  it("gives a guest a read-and-comment view with no team controls", () => {
    render(<LiveRun run={GUEST_RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    expect(screen.getByText(/You are a guest on this run/)).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Client access" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("checkbox", { name: "Visible to the client" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Comment" })).toBeInTheDocument();
    expect(screen.getByText("The preview is ready for you")).toBeInTheDocument();
  });

  it("labels a client comment that arrives live", async () => {
    await renderSubscribed();

    emit("run_comments", {
      id: "comment-3",
      hook_event_id: null,
      author_id: "client-1",
      body: "Thanks!",
      created_at: "2026-09-28T10:00:09Z",
      audience: "client",
    });

    expect(screen.getByText("Thanks!").closest(".comment")).toHaveTextContent("Visible to client");
  });

  it("does not offer steering to a client guest", () => {
    render(
      <LiveRun
        run={{ ...RUN, viewerRole: "guest" }}
        viewer={VIEWER}
        cliPackageUrl={CLI_PACKAGE_URL}
      />,
    );

    expect(screen.queryByRole("textbox", { name: "Message to the agent" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Hold the run" })).not.toBeInTheDocument();
  });

  it("offers the command to continue from each uploaded checkpoint", () => {
    render(<LiveRun run={RUN} viewer={VIEWER} cliPackageUrl={CLI_PACKAGE_URL} />);

    expect(
      screen.getByText(`npx --yes ${CLI_PACKAGE_URL} resume run-1 --step 1`),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 2").closest("li")).toHaveTextContent("uploading");
  });

  it("does not offer hand over to a client guest", () => {
    render(
      <LiveRun
        run={{ ...RUN, viewerRole: "guest" }}
        viewer={VIEWER}
        cliPackageUrl={CLI_PACKAGE_URL}
      />,
    );

    expect(screen.queryByText(/resume run-1/)).not.toBeInTheDocument();
  });

  it("marks a checkpoint ready when its upload completes", async () => {
    await renderSubscribed();

    emit("run_checkpoints", {
      sequence: 2,
      created_at: "2026-09-28T10:01:05Z",
      uploaded_at: "2026-09-28T10:01:09Z",
    });

    expect(
      screen.getByText(`npx --yes ${CLI_PACKAGE_URL} resume run-1 --step 2`),
    ).toBeInTheDocument();
  });

  it("leaves the channel when the page closes", async () => {
    const { unmount } = await renderSubscribed();

    unmount();

    expect(removeChannelMock).toHaveBeenCalledWith(channelStub);
  });
});
