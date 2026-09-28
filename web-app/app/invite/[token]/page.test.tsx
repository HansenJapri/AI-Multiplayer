import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import InvitePage from "./page";

const { getCurrentUserMock } = vi.hoisted(() => ({ getCurrentUserMock: vi.fn() }));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("./actions", () => ({ acceptInviteAction: vi.fn() }));

const pageProps = { params: Promise.resolve({ token: "invite-token" }) };

describe("InvitePage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
  });

  it("asks a signed-out visitor to sign in and come back to this invite", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    render(await InvitePage(pageProps));

    expect(screen.getByRole("link", { name: "Sign in to accept" })).toHaveAttribute(
      "href",
      "/login?next=%2Finvite%2Finvite-token",
    );
  });

  it("lets a signed-in user join with their email", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-2", email: "friend@example.com" });

    render(await InvitePage(pageProps));

    expect(screen.getByText(/friend@example.com/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join workspace" })).toBeInTheDocument();
  });
});
