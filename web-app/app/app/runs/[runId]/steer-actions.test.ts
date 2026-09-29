// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { holdRunAction, releaseRunAction, sendSteerMessageAction } from "./steer-actions";

const { getCurrentUserMock, queueSteerMessageMock, holdRunMock, releaseRunMock } = vi.hoisted(
  () => ({
    getCurrentUserMock: vi.fn(),
    queueSteerMessageMock: vi.fn(),
    holdRunMock: vi.fn(),
    releaseRunMock: vi.fn(),
  }),
);

vi.mock("@/lib/auth/current-user", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/runs/steering", () => ({
  queueSteerMessage: queueSteerMessageMock,
  holdRun: holdRunMock,
  releaseRun: releaseRunMock,
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const USER = { id: "user-1", email: "driver@agency.example" };

function form(fields: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value);
  }
  return formData;
}

describe("sendSteerMessageAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("queues the trimmed message for the agent", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);
    queueSteerMessageMock.mockResolvedValueOnce(true);

    const state = await sendSteerMessageAction(
      { status: "idle" },
      form({ runId: "run-1", body: "  Use the helper " }),
    );

    expect(state).toEqual({ status: "done" });
    expect(queueSteerMessageMock).toHaveBeenCalledWith({
      runId: "run-1",
      authorId: "user-1",
      body: "Use the helper",
    });
  });

  it("rejects an empty message without contacting the database", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);

    expect(
      await sendSteerMessageAction({ status: "idle" }, form({ runId: "r", body: " " })),
    ).toEqual({ status: "empty" });
    expect(queueSteerMessageMock).not.toHaveBeenCalled();
  });

  it("reports a refusal", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);
    queueSteerMessageMock.mockResolvedValueOnce(false);

    expect(
      await sendSteerMessageAction({ status: "idle" }, form({ runId: "r", body: "x" })),
    ).toEqual({ status: "refused" });
  });
});

describe("holdRunAction and releaseRunAction", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("holds the run with the trimmed reason", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);
    holdRunMock.mockResolvedValueOnce(true);

    expect(
      await holdRunAction({ status: "idle" }, form({ runId: "run-1", reason: " Reviewing " })),
    ).toEqual({ status: "done" });
    expect(holdRunMock).toHaveBeenCalledWith({
      runId: "run-1",
      userId: "user-1",
      reason: "Reviewing",
    });
  });

  it("reports a run that is already held", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);
    holdRunMock.mockResolvedValueOnce(false);

    expect(await holdRunAction({ status: "idle" }, form({ runId: "r", reason: "" }))).toEqual({
      status: "refused",
    });
  });

  it("releases the run", async () => {
    getCurrentUserMock.mockResolvedValueOnce(USER);
    releaseRunMock.mockResolvedValueOnce(true);

    expect(await releaseRunAction({ status: "idle" }, form({ runId: "run-1" }))).toEqual({
      status: "done",
    });
    expect(releaseRunMock).toHaveBeenCalledWith({ runId: "run-1", userId: "user-1" });
  });

  it("sends a signed-out visitor to login", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);

    await expect(releaseRunAction({ status: "idle" }, form({ runId: "r" }))).rejects.toThrow(
      "REDIRECT /login",
    );
  });
});
