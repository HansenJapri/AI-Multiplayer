import { appendFile, copyFile, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { ClaudeSettings } from "./claude-settings.js";
import { AIM_HOOK_SCRIPT_NAME } from "./claude-settings.js";
import type { AimCredentials } from "./hook-forwarder.js";

const OWNER_READ_WRITE_ONLY = 0o600;
const OWNER_ONLY_DIRECTORY = 0o700;
const COMPILED_MODULE_EXTENSIONS = [".js", ".mjs"];

function aimDirectory(homeDirectory: string): string {
  return join(homeDirectory, ".aim");
}

function credentialsPath(homeDirectory: string): string {
  return join(aimDirectory(homeDirectory), "credentials.json");
}

async function readTextIfPresent(path: string): Promise<string | null> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export async function readCredentials(
  homeDirectory: string = homedir(),
): Promise<AimCredentials | null> {
  const text = await readTextIfPresent(credentialsPath(homeDirectory));
  return text === null ? null : (JSON.parse(text) as AimCredentials);
}

// The install token is a bearer secret, so the file is readable by the owner only.
export async function writeCredentials(
  credentials: AimCredentials,
  homeDirectory: string = homedir(),
): Promise<void> {
  await mkdir(aimDirectory(homeDirectory), { recursive: true, mode: OWNER_ONLY_DIRECTORY });
  await writeFile(credentialsPath(homeDirectory), `${JSON.stringify(credentials, null, 2)}\n`, {
    mode: OWNER_READ_WRITE_ONLY,
  });
}

export async function readJsonSettings(path: string): Promise<ClaudeSettings | null> {
  const text = await readTextIfPresent(path);
  return text === null ? null : (JSON.parse(text) as ClaudeSettings);
}

export async function writeJsonSettings(path: string, settings: ClaudeSettings): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(settings, null, 2)}\n`);
}

// .git/info/exclude ignores the file for this clone only, without touching the shared .gitignore.
export async function excludeFromGit(
  projectDirectory: string,
  relativePath: string,
): Promise<void> {
  const gitDirectory = join(projectDirectory, ".git");
  if (!(await pathExists(gitDirectory))) {
    return;
  }
  const excludePath = join(gitDirectory, "info", "exclude");
  const existing = (await readTextIfPresent(excludePath)) ?? "";
  if (existing.split(/\r?\n/).includes(relativePath)) {
    return;
  }
  await mkdir(dirname(excludePath), { recursive: true });
  const separator = existing === "" || existing.endsWith("\n") ? "" : "\n";
  await appendFile(excludePath, `${separator}${relativePath}\n`);
}

// Copies the compiled hook runtime next to the credentials so hooks keep working after the npx
// cache is cleared, and returns the command Claude Code should run for each hook.
export async function installHookRuntime(
  compiledDirectory: string,
  homeDirectory: string = homedir(),
): Promise<string> {
  const runtimeDirectory = join(aimDirectory(homeDirectory), "runtime");
  await mkdir(runtimeDirectory, { recursive: true });
  const compiledFiles = await readdir(compiledDirectory);
  for (const fileName of compiledFiles) {
    if (COMPILED_MODULE_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
      await copyFile(join(compiledDirectory, fileName), join(runtimeDirectory, fileName));
    }
  }
  await writeFile(
    join(runtimeDirectory, "package.json"),
    `${JSON.stringify({ type: "module" })}\n`,
  );
  // Forward slashes work in every shell Claude Code may use to run the hook, including on Windows.
  const hookScriptPath = join(runtimeDirectory, AIM_HOOK_SCRIPT_NAME).replaceAll("\\", "/");
  return `node "${hookScriptPath}"`;
}
