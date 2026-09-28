import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("./actions", () => ({ sendMagicLink: vi.fn() }));

describe("LoginPage", () => {
  it("asks for an email and keeps the page to return to", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ next: "/invite/abc" }) }));

    expect(screen.getByRole("textbox", { name: "Work email" })).toBeInTheDocument();
    expect(screen.getByDisplayValue("/invite/abc")).toHaveAttribute("name", "next");
  });

  it("explains that an expired or used link needs a new one", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ error: "link_invalid" }) }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "That sign-in link is invalid or has expired. Request a new one.",
    );
  });
});
