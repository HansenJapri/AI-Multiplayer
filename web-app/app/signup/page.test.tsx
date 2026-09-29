import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";

vi.mock("./actions", () => ({ signUpAction: vi.fn() }));

describe("SignUpPage", () => {
  it("asks for an email and a new password and keeps the page to return to", async () => {
    render(await SignUpPage({ searchParams: Promise.resolve({ next: "/guest/t" }) }));

    expect(
      screen.getByRole("heading", { level: 1, name: "Create an account" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "new-password");
    expect(screen.getByDisplayValue("/guest/t")).toHaveAttribute("name", "next");
  });

  it("links back to sign in, keeping the page to return to", async () => {
    render(await SignUpPage({ searchParams: Promise.resolve({ next: "/guest/t" }) }));

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login?next=%2Fguest%2Ft",
    );
  });
});
