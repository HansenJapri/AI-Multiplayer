-- One row per machine where the CLI installer registered Claude Code hooks. The user sees the
-- token once; only its SHA-256 digest is stored, so a database leak exposes no usable token.
create table public.cli_installs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  user_id uuid not null references auth.users (id),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  -- Target of the composite foreign key that keeps hook events inside their install's workspace.
  unique (workspace_id, id)
);

create index cli_installs_user_id_idx on public.cli_installs (user_id);

alter table public.cli_installs enable row level security;
