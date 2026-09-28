import {
  installTokenHash,
  invalidCliRequestResponse,
  nonEmptyText,
  readJsonObject,
  unauthorizedCliResponse,
} from "@/lib/cli/cli-request";
import { completeCheckpointUpload } from "@/lib/handover/checkpoints";

export async function POST(request: Request): Promise<Response> {
  const tokenHash = installTokenHash(request);
  if (tokenHash === null) {
    return unauthorizedCliResponse();
  }
  const checkpointId = nonEmptyText((await readJsonObject(request))?.checkpoint_id);
  if (checkpointId === null) {
    return invalidCliRequestResponse();
  }
  const completed = await completeCheckpointUpload(tokenHash, checkpointId);
  return completed
    ? Response.json({ status: "complete" })
    : Response.json({ error: "not_found" }, { status: 404 });
}
