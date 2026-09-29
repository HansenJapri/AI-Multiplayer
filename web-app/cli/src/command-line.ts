export const DEFAULT_API_URL = "https://ai-multiplayer.vercel.app";

const COMMANDS = ["login", "install", "uninstall", "status", "resume", "help"] as const;

export type AimCommand = (typeof COMMANDS)[number];

export interface CommandLine {
  command: AimCommand;
  apiUrl: string;
  runId: string | null;
  step: number | null;
  launch: boolean;
}

function isAimCommand(value: string | undefined): value is AimCommand {
  return COMMANDS.some((command) => command === value);
}

function readFlag(argumentsList: string[], flag: string): string | undefined {
  const flagIndex = argumentsList.indexOf(flag);
  return flagIndex === -1 ? undefined : argumentsList[flagIndex + 1];
}

function readStep(argumentsList: string[]): number | null | "invalid" {
  const stepText = readFlag(argumentsList, "--step");
  if (stepText === undefined) {
    return null;
  }
  const step = Number(stepText);
  return Number.isInteger(step) && step > 0 ? step : "invalid";
}

export function parseCommandLine(
  argumentsList: string[],
  environment: Record<string, string | undefined>,
): CommandLine {
  const [firstArgument, secondArgument] = argumentsList;
  const apiUrl = (
    readFlag(argumentsList, "--api") ??
    environment.AIM_API_URL ??
    DEFAULT_API_URL
  ).replace(/\/+$/, "");
  const step = readStep(argumentsList);
  const runId =
    secondArgument === undefined || secondArgument.startsWith("--") ? null : secondArgument;
  const command = isAimCommand(firstArgument) ? firstArgument : "help";
  const resumeIsIncomplete = command === "resume" && (runId === null || step === "invalid");

  return {
    command: resumeIsIncomplete ? "help" : command,
    apiUrl,
    runId: command === "resume" ? runId : null,
    step: step === "invalid" ? null : step,
    launch: !argumentsList.includes("--no-launch"),
  };
}
