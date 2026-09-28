import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspacePage from "./page";

const {
  getCurrentUserMock,
  listWorkspacesForUserMock,
  listWorkspaceMembersMock,
  listRunsForWorkspaceMock,
} = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  listWorkspacesForUserMock: vi.fn(),
  listWorkspaceMembersMock: vi.fn(),
  listRunsForWorkspaceMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", () => ({
  listWorkspacesForUser: listWorkspacesForUserMock,
}));
vi.mock("@/lib/workspaces/members", () => ({ listWorkspaceMembers: listWorkspaceMembersMock }));
vi.mock("@/lib/runs/runs", () => ({ listRunsForWorkspace: listRunsForWorkspaceMock }));
vi.mock("./actions", () => ({ inviteTeammateAction: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "ai-multiplayer.vercel.app",
      }),
    ),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const pageProps = { params: Promise.resolve({ workspaceId: "workspace-1" }) };

function signedInMemberOf(role: "owner" | "driver") {
  getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "me@agency.example" });
  listWorkspacesForUserMock.mockResolvedValueOnce([
    { id: "workspace-1", name: "Acme Agency", role },
  ]);
  listWorkspaceMembersMock.mockResolvedValueOnce([
    { userId: "user-1", email: "me@agency.example", role },
    { userId: "user-2", email: "teammate@agency.example", role: "driver" },
  ]);
  listRunsForWorkspaceMock.mockResolvedValueOnce([
    { id: "run-1", claudeSessionId: "session-abc", createdAt: "2026-09-28T10:00:00Z" },
  ]);
}

describe("WorkspacePage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listWorkspacesForUserMock.mockReset();
    listWorkspaceMembersMock.mockReset();
    listRunsForWorkspaceMock.mockReset();
  });

  it("lists the workspace runs and links to each timeline", async () => {
    signedInMemberOf("driver");

    render(await WorkspacePage(pageProps));

    expect(screen.getByRole("link", { name: /session-abc/ })).toHaveAttribute(
      "href",
      "/app/runs/run-1",
    );
  });

  it("shows how to connect Claude Code with the CLI served by this site", async () => {
    signedInMemberOf("driver");

    render(await WorkspacePage(pageProps));

    expect(
      screen.getByText("npx --yes https://ai-multiplayer.vercel.app/aim.tgz login"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("npx --yes https://ai-multiplayer.vercel.app/aim.tgz install"),
    ).toBeInTheDocument();
  });

  it("shows the members and lets an owner invite a teammate", async () => {
    signedInMemberOf("owner");

    render(await WorkspacePage(pageProps));

    expect(screen.getByRole("heading", { level: 1, name: "Acme Agency" })).toBeInTheDocument();
    expect(screen.getByText("teammate@agency.example")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Teammate email" })).toBeInTheDocument();
  });

  it("does not offer invites to a driver", async () => {
    signedInMemberOf("driver");

    render(await WorkspacePage(pageProps));

    expect(screen.queryByRole("textbox", { name: "Teammate email" })).not.toBeInTheDocument();
    expect(screen.getByText("Only owners can invite teammates.")).toBeInTheDocument();
  });

  it("answers not found for a workspace the user does not belong to", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "me@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([]);

    await expect(WorkspacePage(pageProps)).rejects.toThrow("NOT_FOUND");
    expect(listWorkspaceMembersMock).not.toHaveBeenCalled();
  });
});
