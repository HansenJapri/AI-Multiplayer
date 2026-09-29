-- The hook route runs as service_role, which may not read auth.users. This helper returns only
-- an account's email, runs as its owner, and lives in the private schema the Data API does not
-- expose; only service_role may call it.
create function private.account_email(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email from auth.users where id = p_user_id;
$$;

revoke all on function private.account_email(uuid) from public;
grant execute on function private.account_email(uuid) to service_role;

create or replace function private.hook_directive(
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
  select jsonb_build_object('raised_by_email', private.account_email(h.raised_by), 'reason', h.reason)
  into active_hold
  from public.run_holds h
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
      jsonb_agg(
        jsonb_build_object('author_email', private.account_email(d.author_id), 'body', d.body)
        order by d.created_at
      ),
      '[]'::jsonb
    ) into delivered_messages
    from delivered d;
  end if;

  return jsonb_build_object(
    'hold', case when p_hook_event_name = 'PreToolUse' then active_hold end,
    'steer_messages', delivered_messages
  );
end;
$$;
