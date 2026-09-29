import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PricingPage from "./page";

describe("PricingPage", () => {
  it("shows Free, Team per driver and Agency per workspace", () => {
    render(<PricingPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Pricing" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Free" })).toHaveTextContent("$0");
    expect(screen.getByRole("region", { name: "Team" })).toHaveTextContent(
      "$30 per driver per month",
    );
    expect(screen.getByRole("region", { name: "Agency" })).toHaveTextContent(
      "$199 per workspace per month",
    );
  });

  it("starts the free plan by creating an account", () => {
    render(<PricingPage />);

    expect(
      within(screen.getByRole("region", { name: "Free" })).getByRole("link", {
        name: "Start free",
      }),
    ).toHaveAttribute("href", "/signup");
  });

  it("offers a refundable deposit for each paid plan", () => {
    render(<PricingPage />);

    expect(
      within(screen.getByRole("region", { name: "Team" })).getByRole("link", {
        name: "Reserve with a refundable deposit",
      }),
    ).toHaveAttribute("href", "/app/deposit?plan=team");
    expect(
      within(screen.getByRole("region", { name: "Agency" })).getByRole("link", {
        name: "Reserve with a refundable deposit",
      }),
    ).toHaveAttribute("href", "/app/deposit?plan=agency");
  });

  it("promises never to store model keys", () => {
    render(<PricingPage />);

    expect(screen.getByText(/never store your model keys/)).toBeInTheDocument();
  });
});
