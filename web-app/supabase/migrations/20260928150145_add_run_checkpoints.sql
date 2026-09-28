-- Hand over (AGENTS.md section 3): at the end of each agent turn the CLI snapshots the git working
-- tree as a commit and uploads it with the session transcript. A teammate resumes from the latest
-- checkpoint (or step N) on their own machine; the original run is never overwritten.

create table public.run_checkpoints (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  run_id uuid not null,
  cli_install_id uuid not null,
  sequence integer not null check (sequence > 0),
  commit_sha text not null check (commit_sha ~ '^[0-9a-f]{40}$'),
  created_at timestamptz not null default now(),
  -- Set once the bundle and transcript are in storage; only uploaded checkpoints can be resumed.
  uploaded_at timestamptz,
  unique (run_id, sequence),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id),
  foreign key (workspace_id, cli_install_id) references public.cli_installs (workspace_id, id)
);

create index run_checkpoints_workspace_id_run_id_idx on public.run_checkpoints (workspace_id, run_id);
create index run_checkpoints_workspace_id_cli_install_id_idx
  on public.run_checkpoints (workspace_id, cli_install_id);

alter table public.run_checkpoints enable row level security;

create policy run_checkpoints_select_for_members
  on public.run_checkpoints for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

alter publication supabase_realtime add table public.run_checkpoints;

-- Bundles and transcripts. No storage policies: only the server (service role) reads or writes,
-- and hands out short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit)
values ('checkpoints', 'checkpoints', false, 52428800)
on conflict (id) do nothing;

-- Finds or creates the run of a Claude Code session and records run_created when it is new.
create function private.session_run_id(
  p_workspace_id uuid,
  p_actor_id uuid,
  p_claude_session_id text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  session_run_id uuid;
begin
  insert into public.runs (workspace_id, claude_session_id)
  values (p_workspace_id, p_claude_session_id)
  on conflict (workspace_id, claude_session_id) do nothing
  returning id into session_run_id;

  if session_run_id is not null then
    insert into public.events (workspace_id, run_id, actor_id, name)
    values (p_workspace_id, session_run_id, p_actor_id, 'run_created');
    return session_run_id;
  end if;

  select id into session_run_id
  from public.runs
  where workspace_id = p_workspace_id and claude_session_id = p_claude_session_id;
  return session_run_id;
end;
$$;

grant execute on function private.session_run_id(uuid, uuid, text) to service_role;

-- Refactor: ingest now shares the run lookup; behaviour is unchanged.
create or replace function public.ingest_hook_event(
  p_token_hash text,
  p_claude_session_id text,
  p_hook_event_name text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sending_install public.cli_installs%rowtype;
  session_run_id uuid;
  stored_hook_event_id uuid;
begin
  select * into sending_install
  from public.cli_installs
  where token_hash = p_token_hash and revoked_at is null;

  if not found then
    return null;
  end if;

  session_run_id := private.session_run_id(
    sending_install.workspace_id, sending_install.user_id, p_claude_session_id
  );

  insert into public.hook_events (workspace_id, run_id, cli_install_id, hook_event_name, payload)
  values (
    sending_install.workspace_id,
    session_run_id,
    sending_install.id,
    p_hook_event_name,
    p_payload
  )
  returning id into stored_hook_event_id;

  return jsonb_build_object('hook_event_id', stored_hook_event_id)
    || private.hook_directive(sending_install.workspace_id, session_run_id, p_hook_event_name);
end;
$$;

-- Returns {checkpoint_id, run_id, workspace_id, sequence}, or null for an unknown or revoked token.
create function public.create_run_checkpoint(
  p_token_hash text,
  p_claude_session_id text,
  p_commit_sha text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sending_install public.cli_installs%rowtype;
  session_run_id uuid;
  next_sequence integer;
  new_checkpoint_id uuid;
begin
  select * into sending_install
  from public.cli_installs
  where token_hash = p_token_hash and revoked_at is null;

  if not found then
    return null;
  end if;

  session_run_id := private.session_run_id(
    sending_install.workspace_id, sending_install.user_id, p_claude_session_id
  );

  -- Serializes numbering when two checkpoints of one run arrive together.
  perform 1 from public.runs where id = session_run_id for update;
  select coalesce(max(sequence), 0) + 1 into next_sequence
  from public.run_checkpoints
  where run_id = session_run_id;

  insert into public.run_checkpoints (workspace_id, run_id, cli_install_id, sequence, commit_sha)
  values (sending_install.workspace_id, session_run_id, sending_install.id, next_sequence, p_commit_sha)
  returning id into new_checkpoint_id;

  return jsonb_build_object(
    'checkpoint_id', new_checkpoint_id,
    'run_id', session_run_id,
    'workspace_id', sending_install.workspace_id,
    'sequence', next_sequence
  );
end;
$$;

create function public.complete_run_checkpoint(p_token_hash text, p_checkpoint_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.run_checkpoints c
  set uploaded_at = now()
  from public.cli_installs i
  where c.id = p_checkpoint_id
    and c.uploaded_at is null
    and i.id = c.cli_install_id
    and i.token_hash = p_token_hash
    and i.revoked_at is null;
  return found;
end;
$$;

-- Returns the checkpoint to continue from (the latest uploaded one, or step p_sequence), or null
-- when the install's user is no longer a member of the run's workspace or the step is not ready.
-- Nothing of the previous owner's access is passed on: the resuming user acts with their own.
create function public.resolve_checkpoint_for_resume(
  p_token_hash text,
  p_run_id uuid,
  p_sequence integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  resuming_install public.cli_installs%rowtype;
  chosen public.run_checkpoints%rowtype;
  checkpoint_count integer;
  resumed_session_id text;
begin
  select i.* into resuming_install
  from public.cli_installs i
  join public.runs r on r.id = p_run_id and r.workspace_id = i.workspace_id
  join public.workspace_members m on m.workspace_id = i.workspace_id and m.user_id = i.user_id
  where i.token_hash = p_token_hash and i.revoked_at is null;

  if not found then
    return null;
  end if;

  select * into chosen
  from public.run_checkpoints
  where run_id = p_run_id
    and uploaded_at is not null
    and (p_sequence is null or sequence = p_sequence)
  order by sequence desc
  limit 1;

  if not found then
    return null;
  end if;

  select count(*) into checkpoint_count from public.run_checkpoints where run_id = p_run_id;
  select claude_session_id into resumed_session_id from public.runs where id = p_run_id;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (
    chosen.workspace_id, p_run_id, resuming_install.user_id, 'checkpoint_resume',
    jsonb_build_object(
      'from_step', chosen.sequence,
      'fraction_reexecuted', round((checkpoint_count - chosen.sequence)::numeric / checkpoint_count, 2)
    )
  );

  return jsonb_build_object(
    'checkpoint_id', chosen.id,
    'run_id', p_run_id,
    'workspace_id', chosen.workspace_id,
    'sequence', chosen.sequence,
    'commit_sha', chosen.commit_sha,
    'claude_session_id', resumed_session_id
  );
end;
$$;

revoke execute on function public.create_run_checkpoint(text, text, text)
  from public, anon, authenticated;
revoke execute on function public.complete_run_checkpoint(text, uuid)
  from public, anon, authenticated;
revoke execute on function public.resolve_checkpoint_for_resume(text, uuid, integer)
  from public, anon, authenticated;
grant execute on function public.create_run_checkpoint(text, text, text) to service_role;
grant execute on function public.complete_run_checkpoint(text, uuid) to service_role;
grant execute on function public.resolve_checkpoint_for_resume(text, uuid, integer) to service_role;
