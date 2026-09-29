// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  checkoutFromBundle,
  createSnapshotBundle,
  isCleanWorkingTree,
  isGitRepository,
} from "./git-snapshot.js";

const GIT_IDENTITY = ["-c", "user.name=Test", "-c", "user.email=test@example.test"];

function git(directory: string, ...args: string[]): string {
  return execFileSync("git", [...GIT_IDENTITY, ...args], {
    cwd: directory,
    encoding: "utf8",
  }).trim();
}

let sandbox: string;
let original: string;

beforeEach(async () => {
  sandbox = await mkdtemp(join(tmpdir(), "aim-git-test-"));
  original = join(sandbox, "original");
  execFileSync("git", ["init", "-q", original]);
  await writeFile(join(original, "README.md"), "first\n");
  git(original, "add", "README.md");
  git(original, "commit", "-q", "-m", "init");
});

afterEach(async () => {
  await rm(sandbox, { recursive: true, force: true });
});

describe("isGitRepository", () => {
  it("recognises a git working tree", async () => {
    expect(await isGitRepository(original)).toBe(true);
    expect(await isGitRepository(sandbox)).toBe(false);
  });
});

describe("createSnapshotBundle", () => {
  it("captures uncommitted and untracked changes without touching the branch, index or files", async () => {
    await writeFile(join(original, "README.md"), "first\nchanged by the agent\n");
    await writeFile(join(original, "new-file.txt"), "created by the agent\n");
    const headBefore = git(original, "rev-parse", "HEAD");
    const statusBefore = git(original, "status", "--porcelain");

    const snapshot = await createSnapshotBundle(original, join(sandbox, "snapshot.bundle"));

    expect(snapshot.commitSha).toMatch(/^[0-9a-f]{40}$/);
    expect(git(original, "rev-parse", "HEAD")).toBe(headBefore);
    expect(git(original, "status", "--porcelain")).toBe(statusBefore);
    expect(git(original, "show", `${snapshot.commitSha}:new-file.txt`)).toBe(
      "created by the agent",
    );
    expect(git(original, "show", `${snapshot.commitSha}:README.md`)).toBe(
      "first\nchanged by the agent",
    );
  });
});

describe("checkoutFromBundle", () => {
  it("puts a teammate's clone on a new branch at the snapshot", async () => {
    await writeFile(join(original, "README.md"), "first\nsecond\n");
    const snapshot = await createSnapshotBundle(original, join(sandbox, "snapshot.bundle"));
    const teammate = join(sandbox, "teammate");
    execFileSync("git", ["clone", "-q", original, teammate]);

    await checkoutFromBundle(teammate, join(sandbox, "snapshot.bundle"), {
      commitSha: snapshot.commitSha,
      branchName: "aim/resume/run-1-step-1",
    });

    expect(git(teammate, "rev-parse", "--abbrev-ref", "HEAD")).toBe("aim/resume/run-1-step-1");
    // Line endings follow the teammate's own git settings (core.autocrlf on Windows).
    const checkedOut = await readFile(join(teammate, "README.md"), "utf8");
    expect(checkedOut.replaceAll("\r\n", "\n")).toBe("first\nsecond\n");
  });

  it("refuses to touch a clone with uncommitted changes", async () => {
    const snapshot = await createSnapshotBundle(original, join(sandbox, "snapshot.bundle"));
    const teammate = join(sandbox, "teammate");
    execFileSync("git", ["clone", "-q", original, teammate]);
    await writeFile(join(teammate, "wip.txt"), "unsaved work\n");

    expect(await isCleanWorkingTree(teammate)).toBe(false);
    await expect(
      checkoutFromBundle(teammate, join(sandbox, "snapshot.bundle"), {
        commitSha: snapshot.commitSha,
        branchName: "aim/resume/x",
      }),
    ).rejects.toThrow("has uncommitted changes");
  });
});
