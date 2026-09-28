-- Append-only product instrumentation (AGENTS.md section 6). Hook payloads live elsewhere.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  run_id uuid,
  actor_id uuid,
  name text not null check (
    name in (
      'run_created',
      'participant_joined',
      'comment_posted',
      'steer_message_queued',
      'steer_message_delivered',
      'hold_raised',
      'hold_released',
      'checkpoint_resume',
      'guest_invited',
      'invite_sent',
      'invite_accepted',
      'deposit_started',
      'deposit_completed'
    )
  ),
  props jsonb not null default '{}'::jsonb check (jsonb_typeof(props) = 'object'),
  created_at timestamptz not null default now(),
  -- Composite key: an event can only point at a run that belongs to the same workspace.
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

-- Timeline reads per workspace and per run; each index also covers one of the foreign keys.
create index events_workspace_id_created_at_idx on public.events (workspace_id, created_at);
create index events_workspace_id_run_id_created_at_idx on public.events (workspace_id, run_id, created_at);

alter table public.events enable row level security;

create function public.reject_event_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'events is append-only';
end;
$$;

create trigger events_reject_update_delete
before update or delete on public.events
for each row execute function public.reject_event_mutation();

create trigger events_reject_truncate
before truncate on public.events
for each statement execute function public.reject_event_mutation();
