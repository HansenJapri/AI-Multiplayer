export const DEFAULT_API_URL = "https://ai-multiplayer.vercel.app";

const COMMANDS = ["login", "install", "uninstall", "status", "help"] as const;

export type AimCommand = (typeof COMMANDS)[number];

export interface CommandLine {
  command: AimCommand;
  apiUrl: string;
}

function isAimCommand(value: string | undefined): value is AimCommand {
  return COMMANDS.some((command) => command === value);
}

function readFlag(argumentsList: string[], flag: string): string | undefined {
  const flagIndex = argumentsList.indexOf(flag);
  return flagIndex === -1 ? undefined : argumentsList[flagIndex + 1];
}

export function parseCommandLine(
  argumentsList: string[],
  environment: Record<string, string | undefined>,
): CommandLine {
  const [firstArgument] = argumentsList;
  const apiUrl = readFlag(argumentsList, "--api") ?? environment.AIM_API_URL ?? DEFAULT_API_URL;
  return {
    command: isAimCommand(firstArgument) ? firstArgument : "help",
    apiUrl: apiUrl.replace(/\/+$/, ""),
  };
}
