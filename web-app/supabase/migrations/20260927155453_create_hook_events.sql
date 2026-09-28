-- Shared by every append-only table. The message names the table so the caller sees which one refused.
create function public.reject_append_only_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception '% is append-only', tg_table_name;
end;
$$;

drop trigger events_reject_update_delete on public.events;
drop trigger events_reject_truncate on public.events;
drop function public.reject_event_mutation();

create trigger events_reject_update_delete
before update or delete on public.events
for each row execute function public.reject_append_only_mutation();

create trigger events_reject_truncate
before truncate on public.events
for each statement execute function public.reject_append_only_mutation();

-- Raw Claude Code hook payloads that make up a run's timeline. Instrumentation stays in events.
create table public.hook_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  run_id uuid not null,
  cli_install_id uuid not null,
  hook_event_name text not null check (
    hook_event_name in ('SessionStart', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse', 'Stop')
  ),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  received_at timestamptz not null default now(),
  -- Composite keys: the run and the sending install must both belong to the event's workspace.
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id),
  foreign key (workspace_id, cli_install_id) references public.cli_installs (workspace_id, id)
);

-- Run timeline reads; each index also covers one of the composite foreign keys.
create index hook_events_workspace_id_run_id_received_at_idx
  on public.hook_events (workspace_id, run_id, received_at);
create index hook_events_workspace_id_cli_install_id_idx
  on public.hook_events (workspace_id, cli_install_id);

alter table public.hook_events enable row level security;

create trigger hook_events_reject_update_delete
before update or delete on public.hook_events
for each row execute function public.reject_append_only_mutation();

create trigger hook_events_reject_truncate
before truncate on public.hook_events
for each statement execute function public.reject_append_only_mutation();
