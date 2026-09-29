import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SharedRun } from "@/lib/runs/guests";
import DashboardPage from "./page";

const { getCurrentUserMock, listWorkspacesForUserMock, listRunsSharedWithGuestMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    listWorkspacesForUserMock: vi.fn(),
    listRunsSharedWithGuestMock: vi.fn((): Promise<SharedRun[]> => Promise.resolve([])),
  }),
);

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", () => ({
  listWorkspacesForUser: listWorkspacesForUserMock,
}));
vi.mock("@/lib/runs/guests", () => ({ listRunsSharedWithGuest: listRunsSharedWithGuestMock }));
vi.mock("./actions", () => ({ createWorkspaceAction: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

describe("DashboardPage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listWorkspacesForUserMock.mockReset();
  });

  it("lists the user's workspaces with their role and links to each", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([
      { id: "workspace-1", name: "Acme Agency", role: "owner" },
      { id: "workspace-2", name: "Beta Studio", role: "driver" },
    ]);

    render(await DashboardPage());

    expect(screen.getByRole("link", { name: /Acme Agency/ })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace-1",
    );
    expect(screen.getByRole("link", { name: /Beta Studio/ })).toHaveTextContent("driver");
    expect(screen.getByRole("textbox", { name: "Workspace name" })).toBeInTheDocument();
  });

  it("invites a user without workspaces to create the first one", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([]);

    render(await DashboardPage());

    expect(
      screen.getByText("Create your first workspace to start sharing runs."),
    ).toBeInTheDocument();
  });

  it("lists the runs a client was invited to, linking straight to each", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-1", email: "buyer@client.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([]);
    listRunsSharedWithGuestMock.mockResolvedValueOnce([
      {
        runId: "run-1",
        claudeSessionId: "session-1",
        workspaceName: "Acme Agency",
        sharedAt: "2026-09-29T10:00:00Z",
      },
    ]);

    render(await DashboardPage());

    expect(listRunsSharedWithGuestMock).toHaveBeenCalledWith("client-1");
    expect(screen.getByRole("heading", { name: "Shared with you" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Acme Agency/ })).toHaveAttribute(
      "href",
      "/app/runs/run-1",
    );
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(DashboardPage()).rejects.toThrow("REDIRECT /login?next=%2Fapp");
  });
});
