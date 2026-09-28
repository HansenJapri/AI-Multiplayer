import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ActivateCliPage from "./page";

const { getCurrentUserMock, listWorkspacesForUserMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  listWorkspacesForUserMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", () => ({
  listWorkspacesForUser: listWorkspacesForUserMock,
}));
vi.mock("./actions", () => ({ approveCliLoginAction: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const pageProps = { searchParams: Promise.resolve({ code: "ABCD-EFGH" }) };

describe("ActivateCliPage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    listWorkspacesForUserMock.mockReset();
  });

  it("prefills the code from the CLI and lets the user pick the workspace", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([
      { id: "workspace-1", name: "Acme Agency", role: "owner" },
      { id: "workspace-2", name: "Beta Studio", role: "driver" },
    ]);

    render(await ActivateCliPage(pageProps));

    expect(screen.getByRole("textbox", { name: "Code shown in your terminal" })).toHaveValue(
      "ABCD-EFGH",
    );
    expect(screen.getByRole("combobox", { name: "Workspace" })).toHaveTextContent("Acme Agency");
    expect(screen.getByRole("button", { name: "Connect this machine" })).toBeInTheDocument();
  });

  it("asks a user without a workspace to create one first", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    listWorkspacesForUserMock.mockResolvedValueOnce([]);

    render(await ActivateCliPage(pageProps));

    expect(screen.getByRole("link", { name: "Create a workspace" })).toHaveAttribute(
      "href",
      "/app",
    );
  });

  it("sends a signed-out visitor to login and back with the code", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(ActivateCliPage(pageProps)).rejects.toThrow(
      "REDIRECT /login?next=%2Fcli%2Factivate%3Fcode%3DABCD-EFGH",
    );
  });
});
