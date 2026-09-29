// Packs the compiled CLI into public/aim-<version>.tgz so `npx <site>/aim.tgz` works without an npm publish.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, renameSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webAppDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const cliDirectory = join(webAppDirectory, "cli");
const publicDirectory = join(webAppDirectory, "public");
const { name, version } = JSON.parse(readFileSync(join(cliDirectory, "package.json"), "utf8"));

// Run as an npm script, npm_execpath points at npm's own CLI, which avoids a shell (npm.cmd on
// Windows) and the quoting problems of paths that contain spaces.
const npmCli = process.env.npm_execpath;
if (npmCli === undefined) {
  throw new Error("Run this through `npm run cli:build` so npm_execpath is set.");
}

mkdirSync(publicDirectory, { recursive: true });
execFileSync(
  process.execPath,
  [npmCli, "pack", "--silent", "--pack-destination", publicDirectory],
  {
    cwd: cliDirectory,
    stdio: "inherit",
  },
);
// Versioned file name: npx caches by URL, so a new release must never reuse an old URL.
renameSync(
  join(publicDirectory, `${name}-${version}.tgz`),
  join(publicDirectory, `aim-${version}.tgz`),
);
