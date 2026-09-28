-- Tenant root. Its id is the workspace_id every other table carries (AGENTS.md section 5).
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);

-- Deny-by-default: no policies yet, so only the service role (which bypasses RLS) can touch rows.
alter table public.workspaces enable row level security;
