// @vitest-environment node
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  excludeFromGit,
  installHookRuntime,
  readCredentials,
  readJsonSettings,
  writeCredentials,
  writeJsonSettings,
} from "./node-io.js";

const OWNER_READ_WRITE_ONLY = 0o600;
const PERMISSION_BITS = 0o777;

let sandbox: string;

beforeEach(async () => {
  sandbox = await mkdtemp(join(tmpdir(), "aim-cli-test-"));
});

afterEach(async () => {
  await rm(sandbox, { recursive: true, force: true });
});

describe("credentials", () => {
  it("round-trips credentials through ~/.aim/credentials.json", async () => {
    const credentials = {
      apiUrl: "https://ai-multiplayer.vercel.app",
      installToken: "install-token",
      workspaceId: "workspace-1",
    };

    await writeCredentials(credentials, sandbox);

    expect(await readCredentials(sandbox)).toEqual(credentials);
  });

  it.skipIf(process.platform === "win32")(
    "keeps the credentials file private to the user",
    async () => {
      await writeCredentials({ apiUrl: "a", installToken: "t", workspaceId: "w" }, sandbox);

      const { mode } = await stat(join(sandbox, ".aim", "credentials.json"));
      expect(mode & PERMISSION_BITS).toBe(OWNER_READ_WRITE_ONLY);
    },
  );

  it("returns null when the machine never logged in", async () => {
    expect(await readCredentials(sandbox)).toBeNull();
  });
});

describe("settings files", () => {
  it("creates missing folders and writes pretty JSON with a trailing newline", async () => {
    const path = join(sandbox, ".claude", "settings.local.json");

    await writeJsonSettings(path, { model: "sonnet" });

    expect(await readFile(path, "utf8")).toBe('{\n  "model": "sonnet"\n}\n');
    expect(await readJsonSettings(path)).toEqual({ model: "sonnet" });
  });

  it("reads a missing settings file as null", async () => {
    expect(await readJsonSettings(join(sandbox, "missing.json"))).toBeNull();
  });
});

describe("excludeFromGit", () => {
  it("adds the path to .git/info/exclude once", async () => {
    await mkdir(join(sandbox, ".git", "info"), { recursive: true });
    await writeFile(join(sandbox, ".git", "info", "exclude"), "# local\n");

    await excludeFromGit(sandbox, ".claude/settings.local.json");
    await excludeFromGit(sandbox, ".claude/settings.local.json");

    expect(await readFile(join(sandbox, ".git", "info", "exclude"), "utf8")).toBe(
      "# local\n.claude/settings.local.json\n",
    );
  });

  it("does nothing outside a git repository", async () => {
    await expect(excludeFromGit(sandbox, ".claude/settings.local.json")).resolves.toBeUndefined();
  });
});

describe("installHookRuntime", () => {
  it("copies the compiled runtime into ~/.aim/runtime as an ES module package", async () => {
    const compiled = join(sandbox, "dist");
    await mkdir(compiled);
    await writeFile(join(compiled, "aim-hook.mjs"), "export {};\n");
    await writeFile(join(compiled, "hook-forwarder.js"), "export {};\n");

    const command = await installHookRuntime(compiled, sandbox);

    const runtime = join(sandbox, ".aim", "runtime");
    expect(await readFile(join(runtime, "hook-forwarder.js"), "utf8")).toBe("export {};\n");
    expect(JSON.parse(await readFile(join(runtime, "package.json"), "utf8"))).toEqual({
      type: "module",
    });
    expect(command).toBe(`node "${join(runtime, "aim-hook.mjs").replaceAll("\\", "/")}"`);
  });
});
