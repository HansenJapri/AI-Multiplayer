import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stop `next dev` from writing web-app/AGENTS.md and CLAUDE.md: agent rules live in the
  // repository's own AGENTS.md, and a second generated copy would compete with it.
  agentRules: false,
};

export default nextConfig;
