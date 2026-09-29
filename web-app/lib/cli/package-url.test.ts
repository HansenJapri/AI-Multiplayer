// @vitest-environment node
import { describe, expect, it } from "vitest";
import cliPackage from "@/cli/package.json";
import { aimPackageUrl } from "./package-url";

describe("aimPackageUrl", () => {
  // npx keeps what it installed from a URL, so every CLI release needs a URL of its own.
  it("names the tarball after the CLI version so npx never reuses an older install", () => {
    expect(aimPackageUrl("https://ai-multiplayer.vercel.app")).toBe(
      `https://ai-multiplayer.vercel.app/aim-${cliPackage.version}.tgz`,
    );
  });
});
