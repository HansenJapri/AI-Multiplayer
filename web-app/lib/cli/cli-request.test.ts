// @vitest-environment node
import { describe, expect, it } from "vitest";
import { hashOpaqueToken } from "@/lib/security/opaque-token";
import { installTokenHash, nonEmptyText, readJsonObject } from "./cli-request";

function post(body: string, authorization?: string): Request {
  const headers = new Headers();
  if (authorization !== undefined) {
    headers.set("authorization", authorization);
  }
  return new Request("https://example.test", { method: "POST", headers, body });
}

describe("installTokenHash", () => {
  it("hashes the Bearer install token", () => {
    expect(installTokenHash(post("{}", "Bearer abc"))).toBe(hashOpaqueToken("abc"));
  });

  it("returns null without a Bearer token", () => {
    expect(installTokenHash(post("{}"))).toBeNull();
  });
});

describe("readJsonObject", () => {
  it("reads a JSON object and refuses anything else", async () => {
    expect(await readJsonObject(post('{"a":1}'))).toEqual({ a: 1 });
    expect(await readJsonObject(post("[1]"))).toBeNull();
    expect(await readJsonObject(post("not json"))).toBeNull();
  });
});

describe("nonEmptyText", () => {
  it("keeps non-blank strings only", () => {
    expect(nonEmptyText("run-1")).toBe("run-1");
    expect(nonEmptyText("  ")).toBeNull();
    expect(nonEmptyText(7)).toBeNull();
  });
});
