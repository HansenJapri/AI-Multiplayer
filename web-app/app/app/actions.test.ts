// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createWorkspaceAction } from "./actions";

const { getCurrentUserMock, createWorkspaceMock } = vi.hoisted(() => ({
  getCurrentUserMock: vi.fn(),
  createWorkspaceMock: vi.fn(),
}));

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/workspaces/workspaces", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/workspaces/workspaces")>()),
  createWorkspace: createWorkspaceMock,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

function nameForm(name: string): FormData {
  const formData = new FormData();
  formData.set("name", name);
  return formData;
}

describe("createWorkspaceAction", () => {
  afterEach(() => {
    getCurrentUserMock.mockReset();
    createWorkspaceMock.mockReset();
  });

  it("creates the workspace for the signed-in user and opens it", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });
    createWorkspaceMock.mockResolvedValueOnce("workspace-1");

    await expect(createWorkspaceAction({ status: "idle" }, nameForm(" Acme "))).rejects.toThrow(
      "REDIRECT /app/workspaces/workspace-1",
    );
    expect(createWorkspaceMock).toHaveBeenCalledWith("user-1", "Acme");
  });

  it("rejects an invalid name", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", email: "dev@agency.example" });

    expect(await createWorkspaceAction({ status: "idle" }, nameForm("   "))).toEqual({
      status: "invalid_name",
    });
    expect(createWorkspaceMock).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(createWorkspaceAction({ status: "idle" }, nameForm("Acme"))).rejects.toThrow(
      "REDIRECT /login",
    );
  });
});
