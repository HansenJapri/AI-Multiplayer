-- Stores one Claude Code hook call atomically: verifies the install token, finds or creates the
-- run for the session, records run_created for a new run, and appends the hook event.
-- Returns null when the token is unknown or revoked so the caller can answer 401.
create function public.ingest_hook_event(
  p_token_hash text,
  p_claude_session_id text,
  p_hook_event_name text,
  p_payload jsonb
)
returns uuid
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

  return stored_hook_event_id;
end;
$$;

-- Only the server (service role) may ingest; clients would otherwise reach this through RPC.
revoke execute on function public.ingest_hook_event(text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.ingest_hook_event(text, text, text, jsonb) to service_role;
