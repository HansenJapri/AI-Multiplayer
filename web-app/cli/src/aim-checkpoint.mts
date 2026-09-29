// Detached process started by the Stop hook: snapshots the project and uploads the checkpoint.
import { randomBytes } from "node:crypto";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { uploadCheckpoint } from "./checkpoint-uploader.js";
import { createSnapshotBundle, isGitRepository } from "./git-snapshot.js";
import { readCredentials } from "./node-io.js";

const [hookBodyPath] = process.argv.slice(2);

if (hookBodyPath !== undefined) {
  const hookBody = await readFile(hookBodyPath, "utf8").catch(() => "");
  await rm(hookBodyPath, { force: true });
  await uploadCheckpoint(hookBody, {
    readCredentials: () => readCredentials(),
    isGitRepository,
    createSnapshotBundle,
    readFileBytes: async (path) => new Uint8Array(await readFile(path)),
    temporaryBundlePath: () => join(tmpdir(), `aim-${randomBytes(8).toString("hex")}.bundle`),
    removeFile: (path) => rm(path, { force: true }),
    fetch,
  });
}
