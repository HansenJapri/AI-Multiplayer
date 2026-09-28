// Entry point Claude Code runs for every aim hook: reads the hook JSON on stdin, forwards it to
// the server and prints the server's reply (hook output) on stdout.
import { readFile } from "node:fs/promises";
import { forwardHook } from "./hook-forwarder.js";
import { readCredentials } from "./node-io.js";

const inputChunks: Buffer[] = [];
for await (const chunk of process.stdin) {
  inputChunks.push(chunk as Buffer);
}

const output = await forwardHook(Buffer.concat(inputChunks).toString("utf8"), {
  readCredentials: () => readCredentials(),
  readTranscript: (transcriptPath) => readFile(transcriptPath, "utf8").catch(() => null),
  fetch,
});

if (output !== "") {
  process.stdout.write(output);
}
