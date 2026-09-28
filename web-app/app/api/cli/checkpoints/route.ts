import {
  installTokenHash,
  invalidCliRequestResponse,
  nonEmptyText,
  readJsonObject,
  unauthorizedCliResponse,
} from "@/lib/cli/cli-request";
import { startCheckpointUpload } from "@/lib/handover/checkpoints";

const GIT_COMMIT_SHA_PATTERN = /^[0-9a-f]{40}$/;
const HTTP_CREATED = 201;

export async function POST(request: Request): Promise<Response> {
  const tokenHash = installTokenHash(request);
  if (tokenHash === null) {
    return unauthorizedCliResponse();
  }
  const body = await readJsonObject(request);
  const claudeSessionId = nonEmptyText(body?.session_id);
  const commitSha = nonEmptyText(body?.commit_sha);
  if (claudeSessionId === null || commitSha === null || !GIT_COMMIT_SHA_PATTERN.test(commitSha)) {
    return invalidCliRequestResponse();
  }

  const upload = await startCheckpointUpload({ tokenHash, claudeSessionId, commitSha });
  if (upload === null) {
    return unauthorizedCliResponse();
  }
  return Response.json(
    {
      checkpoint_id: upload.checkpointId,
      step: upload.sequence,
      bundle_upload_url: upload.bundleUploadUrl,
      transcript_upload_url: upload.transcriptUploadUrl,
    },
    { status: HTTP_CREATED, headers: { "Cache-Control": "no-store" } },
  );
}
