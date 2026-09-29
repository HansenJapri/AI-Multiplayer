import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "./page";

describe("HomePage", () => {
  it("shows the product name as the page heading", () => {
    render(<HomePage />);

    expect(screen.getByRole("heading", { level: 1, name: "AI Multiplayer" })).toBeInTheDocument();
  });

  it("offers to create an account or sign in", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute("href", "/signup");
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/login");
  });

  it("links to pricing", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/pricing");
  });
});
