# AI Multiplayer — web app

Next.js (App Router, TypeScript strict) app backed by Supabase. Repository rules live in
`AGENTS.md`; read them before changing anything here.

## Setup

```bash
cd web-app
npm install
cp .env.example .env.local   # fill in values from the Supabase dashboard
```

`npm install` also registers the Husky pre-commit hook, which runs `npm run lint` and `npm test`
before every commit.

## Commands

| Command              | What it does                                                        |
| -------------------- | ------------------------------------------------------------------- |
| `npm run dev`        | Start the dev server                                                |
| `npm run build`      | Production build (includes the TypeScript check)                    |
| `npm run lint`       | ESLint (strict, type-aware, zero warnings) + Prettier               |
| `npm run format`     | Rewrite files with Prettier                                         |
| `npm run typecheck`  | `tsc --noEmit`                                                      |
| `npm test`           | Run the Vitest suite once                                           |
| `npm run test:watch` | Run Vitest in watch mode                                            |
| `npm run db:start`   | Start the local Postgres container (needs Docker)                   |
| `npm run db:reset`   | Recreate the local database from `supabase/migrations/`             |
| `npm run test:db`    | Run the pgTAP suite in `supabase/tests/database/`                   |
| `npm run cli:build`  | Compile the aim CLI and pack it into `public/aim.tgz`               |
| `npm run db:types`   | Regenerate `lib/supabase/database.types.ts` from the local database |

## Layout

- `app/` — routes (App Router). API route handlers go under `app/api/`.
- `app/api/health/` — `GET` liveness check.
- `app/api/hooks/ingest/` — `POST` endpoint for Claude Code `http` hooks (see below).
- `lib/hooks/` — install-token parsing and hashing, hook payload validation, hook storage.
- `lib/supabase/` — env validation; browser, server and service-role (server-only) clients;
  generated database types.
- `supabase/migrations/` — SQL migrations (the only way to change the schema).
- `supabase/tests/database/` — pgTAP tests for the schema. Write the test before the migration.

## Database tests

The pgTAP suite needs Docker, so the pre-commit hook does not run it. Run it before committing a
migration:

```bash
npm run db:start   # first run pulls the Postgres image
npm run db:reset
npm run test:db
```

The Supabase CLI waits on stdin when it is not attached to a terminal. In scripts or agents, run
it with `< /dev/null`.

## Hook ingest

Claude Code posts each hook call as JSON to `POST /api/hooks/ingest` with
`Authorization: Bearer <install token>`. The token is hashed (SHA-256) and checked against
`cli_installs`; only the hash is ever stored. Responses:

- `200 {}` — stored. An empty object tells Claude Code to continue without a decision.
- `400` — body is not JSON, or not one of `SessionStart`, `UserPromptSubmit`, `PreToolUse`,
  `PostToolUse`, `Stop` with a `session_id`.
- `401` — token missing, malformed, unknown or revoked (one shared answer).
- `413` — body larger than 1 MiB.
- `500` — storage failed. Claude Code treats any non-2xx answer as a non-blocking hook error.

The `aim` CLI (`cli/`) registers the hooks. `aim login` runs a device-code flow
(`/api/cli/device-logins`, approved at `/cli/activate`) and stores the install token in
`~/.aim/credentials.json`. `aim install` copies the hook runtime to `~/.aim/runtime` and adds a
`command` hook for each of the five events to the project's `.claude/settings.local.json`
(excluded from git). The runtime posts the hook JSON here with the token, adds the latest token
usage from the transcript, and prints the reply as hook output. Command hooks are used because
Claude Code 2.1.216 skips `http` hooks on `SessionStart` ("HTTP hooks are not supported for
SessionStart"), and because the token then never appears in a repository file.

The CLI is packed into `public/aim.tgz` by `npm run cli:build` (run automatically before
`npm run build`), so users run it with `npx --yes https://<site>/aim.tgz <command>`.

## CI

`.github/workflows/ci.yml` (repository root) runs on every push, every pull request and on demand,
with Node 24 to match the Vercel project:

- **Lint, test, build** — `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
- **Database tests (pgTAP)** — `npm run db:start`, `npm run test:db`, then fails if
  `lib/supabase/database.types.ts` differs from what `npm run db:types` generates.

Use these two job names as required status checks when protecting `main`.
