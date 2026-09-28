// Entry point Claude Code runs for every aim hook: reads the hook JSON on stdin, forwards it to
// the server and prints the server's reply (hook output) on stdout.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { forwardHook } from "./hook-forwarder.js";
import { readCredentials } from "./node-io.js";

const runtimeDirectory = dirname(fileURLToPath(import.meta.url));

// The checkpoint upload outlives this hook: it runs as a detached process that reads the hook
// body from a private temporary file, so Claude Code is never kept waiting.
function startCheckpoint(hookBody: string): void {
  const hookBodyPath = join(tmpdir(), `aim-stop-${randomBytes(8).toString("hex")}.json`);
  void writeFile(hookBodyPath, hookBody, { mode: 0o600 })
    .then(() => {
      spawn(process.execPath, [join(runtimeDirectory, "aim-checkpoint.mjs"), hookBodyPath], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      }).unref();
    })
    .catch(() => undefined);
}

const inputChunks: Buffer[] = [];
for await (const chunk of process.stdin) {
  inputChunks.push(chunk as Buffer);
}

const output = await forwardHook(Buffer.concat(inputChunks).toString("utf8"), {
  readCredentials: () => readCredentials(),
  readTranscript: (transcriptPath) => readFile(transcriptPath, "utf8").catch(() => null),
  startCheckpoint,
  fetch,
});

if (output !== "") {
  process.stdout.write(output);
}
