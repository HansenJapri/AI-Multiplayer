import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import WorkspacePage from "./page";

const { getCurrentUserMock, listWorkspacesForUserMock, listWorkspaceMembersMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    listWorkspacesForUserMock: vi.fn(),
    listWorkspaceMembersMock: vi.fn(),
  }),
);

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", () => ({
  listWorkspacesForUser: listWorkspacesForUserMock,
}));
vi.mock("@/lib/workspaces/members", () => ({ listWorkspaceMembers: listWorkspaceMembersMock }));
vi.mock("./actions", () => ({ inviteTeammateAction: vi.fn() }));
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
}

describe("WorkspacePage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listWorkspacesForUserMock.mockReset();
    listWorkspaceMembersMock.mockReset();
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
