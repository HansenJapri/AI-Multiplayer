// Liveness only: answers whether this deployment can serve requests, without touching the database.
export function GET(): Response {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
