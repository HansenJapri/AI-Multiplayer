// @vitest-environment node
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("reports that the app is up", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("tells every cache not to store the answer", () => {
    expect(GET().headers.get("cache-control")).toBe("no-store");
  });
});
