begin;
create extension if not exists pgtap with schema extensions;

select plan(18);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as user_a,
  gen_random_uuid() as install_a,
  encode(sha256('token-a'::bytea), 'hex') as token_hash_a,
  encode(sha256('token-revoked'::bytea), 'hex') as token_hash_revoked,
  encode(sha256('token-unknown'::bytea), 'hex') as token_hash_unknown;

insert into auth.users (id) select user_a from fixture;
insert into public.workspaces (id, name) select workspace_a, 'Workspace A' from fixture;

insert into public.cli_installs (id, workspace_id, user_id, token_hash)
select install_a, workspace_a, user_a, token_hash_a from fixture;
insert into public.cli_installs (workspace_id, user_id, token_hash, revoked_at)
select workspace_a, user_a, token_hash_revoked, now() from fixture;

select has_function(
  'public', 'ingest_hook_event', array['text', 'text', 'text', 'jsonb'],
  'ingest_hook_event(token_hash, claude_session_id, hook_event_name, payload) exists'
);
select function_returns(
  'public', 'ingest_hook_event', array['text', 'text', 'text', 'jsonb'], 'jsonb',
  'ingest_hook_event returns the stored hook event id and the directive for the agent'
);

select is(
  public.ingest_hook_event(
    (select token_hash_unknown from fixture), 'session-1', 'SessionStart', '{}'::jsonb
  ),
  null,
  'an unknown token is refused'
);
select is(
  public.ingest_hook_event(
    (select token_hash_revoked from fixture), 'session-1', 'SessionStart', '{}'::jsonb
  ),
  null,
  'a revoked token is refused'
);
select is_empty(
  $$
    select r.id from public.runs r join fixture f on r.workspace_id = f.workspace_a
    union all
    select h.id from public.hook_events h join fixture f on h.workspace_id = f.workspace_a
  $$,
  'a refused token stores neither a run nor a hook event'
);

select isnt(
  public.ingest_hook_event(
    (select token_hash_a from fixture), 'session-1', 'SessionStart',
    '{"session_id": "session-1", "hook_event_name": "SessionStart"}'::jsonb
  ),
  null,
  'a valid token stores the hook event'
);
select results_eq(
  $$
    select h.workspace_id, h.cli_install_id, h.hook_event_name, h.payload
    from public.hook_events h
    join fixture f on h.workspace_id = f.workspace_a
  $$,
  $$
    select
      workspace_a,
      install_a,
      'SessionStart'::text,
      '{"session_id": "session-1", "hook_event_name": "SessionStart"}'::jsonb
    from fixture
  $$,
  'the hook event is stored in the install workspace with its payload'
);
select results_eq(
  $$
    select r.workspace_id, r.claude_session_id
    from public.runs r
    join fixture f on r.workspace_id = f.workspace_a
  $$,
  $$ select workspace_a, 'session-1'::text from fixture $$,
  'the first hook of a session creates its run'
);
select results_eq(
  $$
    select e.workspace_id, e.run_id, e.actor_id, e.name
    from public.events e
    join fixture f on e.workspace_id = f.workspace_a
  $$,
  $$
    select f.workspace_a, r.id, f.user_a, 'run_created'::text
    from fixture f
    join public.runs r on r.workspace_id = f.workspace_a and r.claude_session_id = 'session-1'
  $$,
  'creating a run records run_created with the install user as actor'
);
select is(
  (
    select h.run_id from public.hook_events h join fixture f on h.workspace_id = f.workspace_a
  ),
  (
    select r.id
    from public.runs r
    join fixture f on r.workspace_id = f.workspace_a
    where r.claude_session_id = 'session-1'
  ),
  'the hook event is linked to the session run'
);

select isnt(
  public.ingest_hook_event((select token_hash_a from fixture), 'session-1', 'PreToolUse', '{}'::jsonb),
  null,
  'a later hook of the same session is stored'
);
select is(
(
    select count(*)::int
    from public.runs t
    join fixture f on t.workspace_id = f.workspace_a
  ),
  1,
  'a later hook of the same session reuses its run'
);
select is(
(
    select count(*)::int
    from public.events t
    join fixture f on t.workspace_id = f.workspace_a
    where t.name = 'run_created'
  ),
  1,
  'run_created is recorded once per run'
);

select isnt(
  public.ingest_hook_event((select token_hash_a from fixture), 'session-2', 'SessionStart', '{}'::jsonb),
  null,
  'a hook from another session is stored'
);
select is(
(
    select count(*)::int
    from public.runs t
    join fixture f on t.workspace_id = f.workspace_a
  ),
  2,
  'another session gets its own run'
);

set local role anon;
select throws_ok(
  $$ select public.ingest_hook_event('x', 'session-x', 'Stop', '{}'::jsonb) $$,
  '42501',
  null,
  'anon cannot call ingest_hook_event'
);
reset role;

set local role authenticated;
select throws_ok(
  $$ select public.ingest_hook_event('x', 'session-x', 'Stop', '{}'::jsonb) $$,
  '42501',
  null,
  'authenticated users cannot call ingest_hook_event'
);
reset role;

set local role service_role;
select lives_ok(
  $$ select public.ingest_hook_event('x', 'session-x', 'Stop', '{}'::jsonb) $$,
  'the server role can call ingest_hook_event'
);
reset role;

select * from finish();
rollback;
