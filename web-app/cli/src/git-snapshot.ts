import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const runExecFile = promisify(execFile);

// The ref only exists while the bundle is written, so the user's repository keeps no trace.
const SNAPSHOT_REF = "refs/aim/checkpoint";
const SNAPSHOT_MESSAGE = "aim checkpoint";
// Synthetic identity: checkpoint commits must not depend on the user's git config.
const SNAPSHOT_IDENTITY = {
  GIT_AUTHOR_NAME: "aim checkpoint",
  GIT_AUTHOR_EMAIL: "checkpoint@aim.invalid",
  GIT_COMMITTER_NAME: "aim checkpoint",
  GIT_COMMITTER_EMAIL: "checkpoint@aim.invalid",
};
const MAX_GIT_OUTPUT_BYTES = 64 * 1024 * 1024;

async function git(
  directory: string,
  args: string[],
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  const { stdout } = await runExecFile("git", args, {
    cwd: directory,
    env: environment,
    maxBuffer: MAX_GIT_OUTPUT_BYTES,
  });
  return stdout.trim();
}

async function tryGit(directory: string, args: string[]): Promise<string | null> {
  try {
    return await git(directory, args);
  } catch {
    return null;
  }
}

export async function isGitRepository(directory: string): Promise<boolean> {
  return (await tryGit(directory, ["rev-parse", "--is-inside-work-tree"])) === "true";
}

export async function isCleanWorkingTree(directory: string): Promise<boolean> {
  return (await git(directory, ["status", "--porcelain"])) === "";
}

// Records the whole working tree, including uncommitted and untracked (not ignored) files, as a
// commit on top of HEAD, using a throwaway index so the user's branch, index and files stay as
// they are. The bundle leaves out history the upstream branch already has.
export async function createSnapshotBundle(
  directory: string,
  bundlePath: string,
): Promise<{ commitSha: string }> {
  const temporaryIndex = join(tmpdir(), `aim-index-${randomBytes(8).toString("hex")}`);
  const snapshotEnvironment = {
    ...process.env,
    ...SNAPSHOT_IDENTITY,
    GIT_INDEX_FILE: temporaryIndex,
  };
  try {
    const headSha = await tryGit(directory, ["rev-parse", "--verify", "HEAD"]);
    if (headSha !== null) {
      await git(directory, ["read-tree", headSha], snapshotEnvironment);
    }
    await git(directory, ["add", "--all"], snapshotEnvironment);
    const treeSha = await git(directory, ["write-tree"], snapshotEnvironment);
    const parentArguments = headSha === null ? [] : ["-p", headSha];
    const commitSha = await git(
      directory,
      ["commit-tree", treeSha, ...parentArguments, "-m", SNAPSHOT_MESSAGE],
      snapshotEnvironment,
    );

    await git(directory, ["update-ref", SNAPSHOT_REF, commitSha]);
    try {
      const upstreamSha = await tryGit(directory, ["rev-parse", "--verify", "@{upstream}"]);
      const exclusions = upstreamSha === null ? [] : [`^${upstreamSha}`];
      await git(directory, ["bundle", "create", bundlePath, SNAPSHOT_REF, ...exclusions]);
    } finally {
      await git(directory, ["update-ref", "-d", SNAPSHOT_REF]);
    }
    return { commitSha };
  } finally {
    await rm(temporaryIndex, { force: true });
  }
}

// Brings the snapshot into a teammate's clone on a new branch. Only a clean working tree is
// touched, so nothing of theirs can be overwritten.
export async function checkoutFromBundle(
  directory: string,
  bundlePath: string,
  target: { commitSha: string; branchName: string },
): Promise<void> {
  if (!(await isCleanWorkingTree(directory))) {
    throw new Error(`${directory} has uncommitted changes; commit or stash them first.`);
  }
  await git(directory, ["bundle", "verify", "--quiet", bundlePath]);
  await git(directory, ["fetch", "--quiet", bundlePath, SNAPSHOT_REF]);
  await git(directory, ["switch", "--quiet", "-c", target.branchName, target.commitSha]);
}
