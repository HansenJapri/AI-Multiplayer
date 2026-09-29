import cliPackage from "@/cli/package.json";

// npx keeps what it installed from a URL, so each CLI release is served under its own URL.
export function aimPackageUrl(origin: string): string {
  return `${origin}/aim-${cliPackage.version}.tgz`;
}
