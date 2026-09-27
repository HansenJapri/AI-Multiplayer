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

| Command              | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Start the dev server                                    |
| `npm run build`      | Production build (includes the TypeScript check)        |
| `npm run lint`       | ESLint (strict, type-aware, zero warnings) + Prettier   |
| `npm run format`     | Rewrite files with Prettier                             |
| `npm run typecheck`  | `tsc --noEmit`                                          |
| `npm test`           | Run the Vitest suite once                               |
| `npm run test:watch` | Run Vitest in watch mode                                |
| `npm run db:start`   | Start the local Postgres container (needs Docker)       |
| `npm run db:reset`   | Recreate the local database from `supabase/migrations/` |
| `npm run test:db`    | Run the pgTAP suite in `supabase/tests/database/`       |

## Layout

- `app/` — routes (App Router). API route handlers go under `app/api/`.
- `lib/supabase/` — env validation plus browser and server Supabase client factories.
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
