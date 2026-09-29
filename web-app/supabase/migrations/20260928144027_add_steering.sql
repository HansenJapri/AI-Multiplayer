-- Steering (AGENTS.md section 3): teammates queue messages that reach the agent after its next
-- tool call, and anyone on the team can hold the run so its next tool call is refused. The app
-- only forwards what people write; it never evaluates it.

create table public.steer_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  run_id uuid not null,
  author_id uuid not null references auth.users (id),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

create index steer_messages_workspace_id_run_id_created_at_idx
  on public.steer_messages (workspace_id, run_id, created_at);
create index steer_messages_author_id_idx on public.steer_messages (author_id);

alter table public.steer_messages enable row level security;

create policy steer_messages_select_for_members
  on public.steer_messages for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

create table public.run_holds (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  run_id uuid not null,
  raised_by uuid not null references auth.users (id),
  reason text not null default '' check (char_length(reason) <= 500),
  raised_at timestamptz not null default now(),
  released_by uuid references auth.users (id),
  released_at timestamptz,
  check ((released_at is null) = (released_by is null)),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

-- At most one active hold per run.
create unique index run_holds_one_active_per_run_key on public.run_holds (run_id) where released_at is null;
create index run_holds_workspace_id_run_id_idx on public.run_holds (workspace_id, run_id);
create index run_holds_raised_by_idx on public.run_holds (raised_by);
create index run_holds_released_by_idx on public.run_holds (released_by);

alter table public.run_holds enable row level security;

create policy run_holds_select_for_members
  on public.run_holds for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

alter publication supabase_realtime add table public.steer_messages, public.run_holds;

-- Workspace of the run when the user is an owner or driver there, otherwise null.
create function private.team_workspace_of_run(p_run_id uuid, p_user_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$
  select r.workspace_id
  from public.runs r
  join public.workspace_members m on m.workspace_id = r.workspace_id and m.user_id = p_user_id
  where r.id = p_run_id;
$$;

grant execute on function private.team_workspace_of_run(uuid, uuid) to service_role;

create function public.queue_steer_message(p_run_id uuid, p_author_id uuid, p_body text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid := private.team_workspace_of_run(p_run_id, p_author_id);
  new_message_id uuid;
begin
  if run_workspace_id is null then
    return null;
  end if;

  insert into public.steer_messages (workspace_id, run_id, author_id, body)
  values (run_workspace_id, p_run_id, p_author_id, btrim(p_body))
  returning id into new_message_id;

  insert into public.events (workspace_id, run_id, actor_id, name)
  values (run_workspace_id, p_run_id, p_author_id, 'steer_message_queued');

  return new_message_id;
end;
$$;

create function public.raise_run_hold(p_run_id uuid, p_user_id uuid, p_reason text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid := private.team_workspace_of_run(p_run_id, p_user_id);
begin
  if run_workspace_id is null then
    return false;
  end if;

  insert into public.run_holds (workspace_id, run_id, raised_by, reason)
  values (run_workspace_id, p_run_id, p_user_id, btrim(coalesce(p_reason, '')))
  on conflict (run_id) where released_at is null do nothing;

  if not found then
    return false;
  end if;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (
    run_workspace_id, p_run_id, p_user_id, 'hold_raised',
    jsonb_build_object('reason', btrim(coalesce(p_reason, '')))
  );
  return true;
end;
$$;

create function public.release_run_hold(p_run_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid := private.team_workspace_of_run(p_run_id, p_user_id);
  released_reason text;
begin
  if run_workspace_id is null then
    return false;
  end if;

  update public.run_holds
  set released_at = now(), released_by = p_user_id
  where run_id = p_run_id and released_at is null
  returning reason into released_reason;

  if not found then
    return false;
  end if;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (
    run_workspace_id, p_run_id, p_user_id, 'hold_released',
    jsonb_build_object('reason', released_reason)
  );
  return true;
end;
$$;

-- The directive for the agent: who holds the run (only for a tool call about to run), and the
-- queued messages to deliver (only after a tool call or with a new prompt, and never while held).
create function private.hook_directive(
  p_workspace_id uuid,
  p_run_id uuid,
  p_hook_event_name text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  active_hold jsonb;
  delivered_messages jsonb := '[]'::jsonb;
begin
  select jsonb_build_object('raised_by_email', u.email, 'reason', h.reason) into active_hold
  from public.run_holds h
  join auth.users u on u.id = h.raised_by
  where h.run_id = p_run_id and h.released_at is null;

  if active_hold is null and p_hook_event_name in ('PostToolUse', 'UserPromptSubmit') then
    with delivered as (
      update public.steer_messages
      set delivered_at = now()
      where run_id = p_run_id and delivered_at is null
      returning id, author_id, body, created_at, delivered_at
    ),
    recorded as (
      insert into public.events (workspace_id, run_id, actor_id, name, props)
      select
        p_workspace_id, p_run_id, d.author_id, 'steer_message_delivered',
        jsonb_build_object(
          'wait_ms', round(extract(epoch from (d.delivered_at - d.created_at)) * 1000)
        )
      from delivered d
    )
    select coalesce(
      jsonb_agg(jsonb_build_object('author_email', u.email, 'body', d.body) order by d.created_at),
      '[]'::jsonb
    ) into delivered_messages
    from delivered d
    join auth.users u on u.id = d.author_id;
  end if;

  return jsonb_build_object(
    'hold', case when p_hook_event_name = 'PreToolUse' then active_hold end,
    'steer_messages', delivered_messages
  );
end;
$$;

grant execute on function private.hook_directive(uuid, uuid, text) to service_role;

-- Same storage as before; the result now also carries the directive for the agent. Returns null
-- when the token is unknown or revoked.
drop function public.ingest_hook_event(text, text, text, jsonb);

create function public.ingest_hook_event(
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

  insert into public.runs (workspace_id, claude_session_id)
  values (sending_install.workspace_id, p_claude_session_id)
  on conflict (workspace_id, claude_session_id) do nothing
  returning id into session_run_id;

  if session_run_id is null then
    select id into session_run_id
    from public.runs
    where workspace_id = sending_install.workspace_id
      and claude_session_id = p_claude_session_id;
  else
    insert into public.events (workspace_id, run_id, actor_id, name)
    values (sending_install.workspace_id, session_run_id, sending_install.user_id, 'run_created');
  end if;

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

revoke execute on function public.ingest_hook_event(text, text, text, jsonb)
  from public, anon, authenticated;
revoke execute on function public.queue_steer_message(uuid, uuid, text)
  from public, anon, authenticated;
revoke execute on function public.raise_run_hold(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.release_run_hold(uuid, uuid) from public, anon, authenticated;
grant execute on function public.ingest_hook_event(text, text, text, jsonb) to service_role;
grant execute on function public.queue_steer_message(uuid, uuid, text) to service_role;
grant execute on function public.raise_run_hold(uuid, uuid, text) to service_role;
grant execute on function public.release_run_hold(uuid, uuid) to service_role;
