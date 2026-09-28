import type { AimCredentials } from "./hook-forwarder.js";

export interface ResumeDependencies {
  projectDirectory: string;
  readCredentials: () => Promise<AimCredentials | null>;
  isGitRepository: (directory: string) => Promise<boolean>;
  isCleanWorkingTree: (directory: string) => Promise<boolean>;
  fetch: typeof fetch;
  downloadToFile: (url: string, path: string) => Promise<void>;
  temporaryPath: (fileName: string) => string;
  checkoutFromBundle: (
    directory: string,
    bundlePath: string,
    target: { commitSha: string; branchName: string },
  ) => Promise<void>;
  installTranscript: (
    transcriptUrl: string,
    projectDirectory: string,
    claudeSessionId: string,
  ) => Promise<string>;
  launchClaude: (claudeSessionId: string) => Promise<number>;
  print: (line: string) => void;
}

export interface ResumeRequest {
  runId: string;
  step: number | null;
  launch: boolean;
}

interface ResumePlan {
  step: number;
  commit_sha: string;
  claude_session_id: string;
  bundle_url: string;
  transcript_url: string;
}

const RUN_ID_PREFIX_LENGTH = 8;

// Claude Code keeps each project's sessions in ~/.claude/projects/<path with every character
// other than a letter or digit replaced by "-">.
export function claudeProjectDirectoryName(projectDirectory: string): string {
  return projectDirectory.replace(/[^a-zA-Z0-9]/g, "-");
}

function resumeBranchName(runId: string, step: number): string {
  return `aim/resume/${runId.slice(0, RUN_ID_PREFIX_LENGTH)}-step-${String(step)}`;
}

async function checkPreconditions(deps: ResumeDependencies): Promise<string | null> {
  if (!(await deps.isGitRepository(deps.projectDirectory))) {
    return "Run `aim resume` inside a clone of the project's git repository.";
  }
  if (!(await deps.isCleanWorkingTree(deps.projectDirectory))) {
    return "This working tree has uncommitted changes. Commit or stash them, then resume.";
  }
  return null;
}

// Continues a teammate's run on this machine as a fork: a new branch at the checkpoint and a new
// Claude Code session forked from the transcript. The original run is never changed.
export async function resumeCommand(
  request: ResumeRequest,
  deps: ResumeDependencies,
): Promise<number> {
  const credentials = await deps.readCredentials();
  if (credentials === null) {
    deps.print("This machine is not connected yet. Run `aim login` first.");
    return 1;
  }
  const problem = await checkPreconditions(deps);
  if (problem !== null) {
    deps.print(problem);
    return 1;
  }

  const response = await deps.fetch(`${credentials.apiUrl}/api/cli/resume`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.installToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ run_id: request.runId, step: request.step }),
  });
  if (!response.ok) {
    deps.print("No checkpoint to resume: the run or step does not exist, or you cannot access it.");
    return 1;
  }
  const plan = (await response.json()) as ResumePlan;

  const bundlePath = deps.temporaryPath("aim-resume.bundle");
  await deps.downloadToFile(plan.bundle_url, bundlePath);
  const branchName = resumeBranchName(request.runId, plan.step);
  await deps.checkoutFromBundle(deps.projectDirectory, bundlePath, {
    commitSha: plan.commit_sha,
    branchName,
  });
  await deps.installTranscript(plan.transcript_url, deps.projectDirectory, plan.claude_session_id);

  deps.print(`Checked out step ${String(plan.step)} on branch ${branchName}.`);
  if (!request.launch) {
    deps.print(`Continue with: claude --resume ${plan.claude_session_id} --fork-session`);
    return 0;
  }
  deps.print("Starting Claude Code as a fork of the run…");
  return deps.launchClaude(plan.claude_session_id);
}
