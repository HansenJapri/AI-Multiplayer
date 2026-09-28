import {
  installTokenHash,
  invalidCliRequestResponse,
  nonEmptyText,
  readJsonObject,
  unauthorizedCliResponse,
} from "@/lib/cli/cli-request";
import { prepareResume } from "@/lib/handover/checkpoints";

function readStep(value: unknown): number | null | "invalid" {
  if (value === undefined || value === null) {
    return null;
  }
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : "invalid";
}

// One answer (404) for "not allowed" and "no such step", so the endpoint reveals nothing about
// runs the install may not resume.
export async function POST(request: Request): Promise<Response> {
  const tokenHash = installTokenHash(request);
  if (tokenHash === null) {
    return unauthorizedCliResponse();
  }
  const body = await readJsonObject(request);
  const runId = nonEmptyText(body?.run_id);
  const step = readStep(body?.step);
  if (runId === null || step === "invalid") {
    return invalidCliRequestResponse();
  }

  const plan = await prepareResume({ tokenHash, runId, step });
  if (plan === null) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(
    {
      run_id: plan.runId,
      step: plan.sequence,
      commit_sha: plan.commitSha,
      claude_session_id: plan.claudeSessionId,
      bundle_url: plan.bundleUrl,
      transcript_url: plan.transcriptUrl,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
