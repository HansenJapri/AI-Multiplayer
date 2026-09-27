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

| Command              | What it does                                          |
| -------------------- | ----------------------------------------------------- |
| `npm run dev`        | Start the dev server                                  |
| `npm run build`      | Production build (includes the TypeScript check)      |
| `npm run lint`       | ESLint (strict, type-aware, zero warnings) + Prettier |
| `npm run format`     | Rewrite files with Prettier                           |
| `npm run typecheck`  | `tsc --noEmit`                                        |
| `npm test`           | Run the Vitest suite once                             |
| `npm run test:watch` | Run Vitest in watch mode                              |

## Layout

- `app/` — routes (App Router). API route handlers go under `app/api/`.
- `lib/supabase/` — env validation plus browser and server Supabase client factories.
- `supabase/migrations/` — SQL migrations (the only way to change the schema).
