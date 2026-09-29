import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import cliPackage from "@/cli/package.json";
import RunPage from "./page";

const { getCurrentUserMock, loadRunForViewerMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  loadRunForViewerMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/runs/runs", () => ({ loadRunForViewer: loadRunForViewerMock }));
vi.mock("./live-run", () => ({
  LiveRun: ({ run, cliPackageUrl }: { run: { steps: unknown[] }; cliPackageUrl: string }) => (
    <p>
      {run.steps.length} steps via {cliPackageUrl}
    </p>
  ),
}));
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        "x-forwarded-proto": "https",
        "x-forwarded-host": "ai-multiplayer.vercel.app",
      }),
    ),
}));
vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NOT_FOUND");
  },
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const pageProps = { params: Promise.resolve({ runId: "run-1" }) };

describe("RunPage", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    loadRunForViewerMock.mockReset();
  });

  it("shows the run with a link back to its workspace", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    loadRunForViewerMock.mockResolvedValueOnce({
      id: "run-1",
      workspaceId: "workspace-1",
      workspaceName: "Acme Agency",
      claudeSessionId: "session-1",
      viewerRole: "owner",
      steps: [{}, {}],
      comments: [],
    });

    render(await RunPage(pageProps));

    expect(loadRunForViewerMock).toHaveBeenCalledWith("run-1", "user-1");
    expect(screen.getByRole("link", { name: "Acme Agency" })).toHaveAttribute(
      "href",
      "/app/workspaces/workspace-1",
    );
    expect(
      screen.getByText(
        `2 steps via https://ai-multiplayer.vercel.app/aim-${cliPackage.version}.tgz`,
      ),
    ).toBeInTheDocument();
  });

  it("tells a guest which agency shared the run, without linking into its workspace", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "client-1", email: "buyer@client.example" });
    loadRunForViewerMock.mockResolvedValueOnce({
      id: "run-1",
      workspaceId: "workspace-1",
      workspaceName: "Acme Agency",
      claudeSessionId: "session-1",
      viewerRole: "guest",
      steps: [],
      comments: [],
    });

    render(await RunPage(pageProps));

    expect(screen.getByText("Shared with you by Acme Agency")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Acme Agency" })).not.toBeInTheDocument();
  });

  it("answers not found for a run the user may not see", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    loadRunForViewerMock.mockResolvedValueOnce(null);

    await expect(RunPage(pageProps)).rejects.toThrow("NOT_FOUND");
  });

  it("sends a signed-out visitor to login and back to the run", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(RunPage(pageProps)).rejects.toThrow("REDIRECT /login?next=%2Fapp%2Fruns%2Frun-1");
  });
});
