import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import GuestInvitePage from "./page";

const { getCurrentUserMock } = vi.hoisted(() => ({ getCurrentUserMock: vi.fn() }));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("./actions", () => ({ acceptGuestInviteAction: vi.fn() }));

const pageProps = { params: Promise.resolve({ token: "guest-token" }) };

describe("GuestInvitePage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
  });

  it("explains what a guest can do and asks a signed-out client to sign in first", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    render(await GuestInvitePage(pageProps));

    expect(screen.getByText(/follow the agent as it works/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in to open the run" })).toHaveAttribute(
      "href",
      "/login?next=%2Fguest%2Fguest-token",
    );
  });

  it("lets a signed-in client open the run with their email", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-1", email: "buyer@client.example" });

    render(await GuestInvitePage(pageProps));

    expect(screen.getByText(/buyer@client.example/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open the run" })).toBeInTheDocument();
  });
});
