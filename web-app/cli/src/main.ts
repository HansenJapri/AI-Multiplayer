#!/usr/bin/env node
import { spawn } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { hasAimHooks } from "./claude-settings.js";
import { parseCommandLine } from "./command-line.js";
import {
  installCommand,
  LOCAL_SETTINGS_RELATIVE_PATH,
  uninstallCommand,
  type InstallDependencies,
} from "./install-command.js";
import { loginCommand } from "./login-command.js";
import {
  excludeFromGit,
  installHookRuntime,
  readCredentials,
  readJsonSettings,
  writeCredentials,
  writeJsonSettings,
} from "./node-io.js";

const HELP_TEXT = `aim — share Claude Code sessions with your team

Usage:
  aim login       Connect this machine to a workspace (opens the browser)
  aim install     Share Claude Code sessions of the current project
  aim uninstall   Stop sharing sessions of the current project
  aim status      Show the connection and this project's sharing state

Options:
  --api <url>     Use another server (default https://ai-multiplayer.vercel.app)`;

const compiledDirectory = dirname(fileURLToPath(import.meta.url));

function print(line: string): void {
  process.stdout.write(`${line}\n`);
}

// Best effort: the URL is printed anyway, so a missing browser opener is not an error.
function openBrowser(url: string): void {
  const [command, commandArguments]: [string, string[]] =
    process.platform === "win32"
      ? ["cmd", ["/c", "start", "", url]]
      : [process.platform === "darwin" ? "open" : "xdg-open", [url]];
  spawn(command, commandArguments, { detached: true, stdio: "ignore" })
    .on("error", () => undefined)
    .unref();
}

function installDependencies(): InstallDependencies {
  return {
    projectDirectory: process.cwd(),
    isLoggedIn: async () => (await readCredentials()) !== null,
    installHookRuntime: () => installHookRuntime(compiledDirectory),
    readSettings: readJsonSettings,
    writeSettings: writeJsonSettings,
    excludeFromGit,
    print,
  };
}

async function statusCommand(): Promise<number> {
  const credentials = await readCredentials();
  print(
    credentials === null
      ? "Not connected. Run `aim login`."
      : `Connected to ${credentials.apiUrl} (workspace ${credentials.workspaceId}).`,
  );
  const settings = await readJsonSettings(`${process.cwd()}/${LOCAL_SETTINGS_RELATIVE_PATH}`);
  print(
    settings !== null && hasAimHooks(settings)
      ? "This project's sessions are shared."
      : "This project's sessions are not shared. Run `aim install` here.",
  );
  return 0;
}

async function run(): Promise<number> {
  const { command, apiUrl } = parseCommandLine(process.argv.slice(2), process.env);
  switch (command) {
    case "login":
      return loginCommand(apiUrl, {
        fetch,
        sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
        print,
        openBrowser,
        writeCredentials: (credentials) => writeCredentials(credentials),
      });
    case "install":
      return installCommand(installDependencies());
    case "uninstall":
      return uninstallCommand(installDependencies());
    case "status":
      return statusCommand();
    case "help":
      print(HELP_TEXT);
      return 0;
  }
}

process.exitCode = await run();
