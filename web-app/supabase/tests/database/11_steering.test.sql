begin;
create extension if not exists pgtap with schema extensions;

select plan(28);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as outsider,
  gen_random_uuid() as run_a,
  encode(sha256('token-a'::bytea), 'hex') as token_hash_a;

grant select on fixture to anon, authenticated, service_role;

insert into auth.users (id, email)
select owner_a, 'steer-owner@fixture.test' from fixture
union all select driver_a, 'steer-driver@fixture.test' from fixture
union all select outsider, 'steer-outsider@fixture.test' from fixture;

insert into public.workspaces (id, name) select workspace_a, 'Workspace A' from fixture;
insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all select workspace_a, driver_a, 'driver' from fixture;
insert into public.cli_installs (workspace_id, user_id, token_hash)
select workspace_a, owner_a, token_hash_a from fixture;
insert into public.runs (id, workspace_id, claude_session_id)
select run_a, workspace_a, 'session-a' from fixture;

create function pg_temp.hook(hook_event_name text) returns jsonb
language sql as $$
  select public.ingest_hook_event(
    (select token_hash_a from pg_temp.fixture), 'session-a', hook_event_name, '{}'::jsonb
  );
$$;

-- Tables
select has_table('public', 'steer_messages', 'steer_messages table exists');
select has_table('public', 'run_holds', 'run_holds table exists');
select fk_ok(
  'public', 'steer_messages', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'steer messages stay inside the run workspace'
);

-- Queueing a steer message
select is(
  public.queue_steer_message((select run_a from fixture), (select outsider from fixture), 'hi'),
  null,
  'someone outside the workspace cannot steer'
);
select isnt(
  public.queue_steer_message(
    (select run_a from fixture), (select driver_a from fixture), 'Use the existing helper'
  ),
  null,
  'a driver queues a steer message'
);
select results_eq(
  $$ select name, actor_id from public.events e join fixture f on e.run_id = f.run_a $$,
  $$ select 'steer_message_queued'::text, driver_a from fixture $$,
  'queueing records steer_message_queued'
);

-- Delivery through hooks
select ok(
  pg_temp.hook('PreToolUse') -> 'steer_messages' = '[]'::jsonb,
  'a message is not delivered before a tool call has run'
);
select results_eq(
  $$ select pg_temp.hook('PostToolUse') -> 'steer_messages' $$,
  $$ values ('[{"author_email": "steer-driver@fixture.test", "body": "Use the existing helper"}]'::jsonb) $$,
  'the message is delivered with the hook that follows the next tool call'
);
select ok(
  pg_temp.hook('PostToolUse') -> 'steer_messages' = '[]'::jsonb,
  'a delivered message is not delivered again'
);
select is(
  (
    select count(*)::int from public.steer_messages s join fixture f on s.run_id = f.run_a
    where s.delivered_at is not null
  ),
  1,
  'the message is marked delivered'
);
select ok(
  (
    select (e.props ->> 'wait_ms')::numeric >= 0
    from public.events e join fixture f on e.run_id = f.run_a
    where e.name = 'steer_message_delivered'
  ),
  'delivery records steer_message_delivered with how long the message waited'
);
select ok(
  pg_temp.hook('PostToolUse') ? 'hook_event_id',
  'the hook is still stored and returns its id'
);

-- Hold
select is(
  public.raise_run_hold((select run_a from fixture), (select outsider from fixture), 'no'),
  false,
  'someone outside the workspace cannot hold the run'
);
select is(
  public.raise_run_hold((select run_a from fixture), (select owner_a from fixture), 'Reviewing the plan'),
  true,
  'an owner holds the run'
);
select is(
  public.raise_run_hold((select run_a from fixture), (select driver_a from fixture), 'again'),
  false,
  'a held run cannot be held twice'
);
select results_eq(
  $$ select pg_temp.hook('PreToolUse') -> 'hold' $$,
  $$ values ('{"raised_by_email": "steer-owner@fixture.test", "reason": "Reviewing the plan"}'::jsonb) $$,
  'the next tool call learns who holds the run and why'
);
select is(
  pg_temp.hook('PostToolUse') -> 'hold',
  'null'::jsonb,
  'only tool calls about to run are held'
);

select isnt(
  public.queue_steer_message((select run_a from fixture), (select owner_a from fixture), 'Wait'),
  null,
  'messages can be queued while the run is held'
);
select ok(
  pg_temp.hook('PostToolUse') -> 'steer_messages' = '[]'::jsonb,
  'messages are kept while the run is held'
);

select is(
  public.release_run_hold((select run_a from fixture), (select outsider from fixture)),
  false,
  'someone outside the workspace cannot release the hold'
);
select is(
  public.release_run_hold((select run_a from fixture), (select driver_a from fixture)),
  true,
  'any member releases the hold'
);
select is(
  pg_temp.hook('PreToolUse') -> 'hold',
  'null'::jsonb,
  'after release, tool calls run again'
);
select ok(
  jsonb_array_length(pg_temp.hook('PostToolUse') -> 'steer_messages') = 1,
  'messages kept during the hold are delivered after release'
);
select results_eq(
  $$
    select e.name, e.props
    from public.events e join fixture f on e.run_id = f.run_a
    where e.name like 'hold_%'
    order by e.created_at, e.name
  $$,
  $$
    values
      ('hold_raised'::text, '{"reason": "Reviewing the plan"}'::jsonb),
      ('hold_released'::text, '{"reason": "Reviewing the plan"}'::jsonb)
  $$,
  'raising and releasing record hold_raised and hold_released with the reason'
);

select is(
  public.ingest_hook_event(encode(sha256('unknown'::bytea), 'hex'), 's', 'Stop', '{}'::jsonb),
  null,
  'an unknown token still stores nothing'
);

-- The hook route calls ingest as service_role, which may not read auth.users directly; the
-- directive must still resolve the hold owner's email.
select public.raise_run_hold((select run_a from fixture), (select owner_a from fixture), 'Check');
set local role service_role;
select results_eq(
  $$
    select public.ingest_hook_event(
      (select token_hash_a from pg_temp.fixture), 'session-a', 'PreToolUse', '{}'::jsonb
    ) -> 'hold'
  $$,
  $$ values ('{"raised_by_email": "steer-owner@fixture.test", "reason": "Check"}'::jsonb) $$,
  'the server role gets the directive, including the email of whoever holds the run'
);
reset role;
select public.release_run_hold((select run_a from fixture), (select owner_a from fixture));

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select driver_a from fixture), 'role', 'authenticated')::text,
  true
);
select is(
  (select count(*)::int from public.steer_messages),
  2,
  'members read the steer messages of their runs'
);
select throws_ok(
  $$ select public.queue_steer_message(gen_random_uuid(), gen_random_uuid(), 'x') $$,
  '42501',
  null,
  'clients cannot queue steer messages directly'
);
reset role;

select * from finish();
rollback;
