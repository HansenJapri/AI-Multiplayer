-- One run per Claude Code session inside a workspace; hooks resolve their run by session id.
create table public.runs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  claude_session_id text not null check (char_length(claude_session_id) > 0),
  created_at timestamptz not null default now(),
  -- Target of the composite foreign key that keeps events inside their run's workspace.
  unique (workspace_id, id),
  unique (workspace_id, claude_session_id)
);

alter table public.runs enable row level security;
