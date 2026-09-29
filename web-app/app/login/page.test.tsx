import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("./actions", () => ({ signInAction: vi.fn() }));

describe("LoginPage", () => {
  it("asks for an email and password and keeps the page to return to", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ next: "/invite/abc" }) }));

    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password");
    expect(screen.getByDisplayValue("/invite/abc")).toHaveAttribute("name", "next");
  });

  it("links to account creation, keeping the page to return to", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({ next: "/invite/abc" }) }));

    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/signup?next=%2Finvite%2Fabc",
    );
  });

  it("links to account creation without a return page when none was given", async () => {
    render(await LoginPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute(
      "href",
      "/signup",
    );
  });
});
