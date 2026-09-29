begin;
create extension if not exists pgtap with schema extensions;

select plan(26);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as workspace_b,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as owner_b,
  gen_random_uuid() as install_a,
  gen_random_uuid() as run_a,
  gen_random_uuid() as run_b,
  gen_random_uuid() as hook_event_a;

grant select on fixture to anon, authenticated;

insert into auth.users (id)
select owner_a from fixture
union all select driver_a from fixture
union all select owner_b from fixture;

insert into public.workspaces (id, name)
select workspace_a, 'Workspace A' from fixture
union all
select workspace_b, 'Workspace B' from fixture;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all select workspace_a, driver_a, 'driver' from fixture
union all select workspace_b, owner_b, 'owner' from fixture;

insert into public.cli_installs (id, workspace_id, user_id, token_hash)
select install_a, workspace_a, owner_a, encode(sha256('token-a'::bytea), 'hex') from fixture;

insert into public.runs (id, workspace_id, claude_session_id)
select run_a, workspace_a, 'session-a' from fixture
union all
select run_b, workspace_b, 'session-b' from fixture;

insert into public.hook_events (id, workspace_id, run_id, cli_install_id, hook_event_name, payload)
select hook_event_a, workspace_a, run_a, install_a, 'PreToolUse', '{"tool_name": "Bash"}'::jsonb
from fixture;

create function pg_temp.sign_in_as(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select null::void;
$$;

-- Members read their own runs and timelines
set local role authenticated;
select pg_temp.sign_in_as((select driver_a from fixture));
select results_eq(
  $$ select id from public.runs $$,
  $$ select run_a from fixture $$,
  'a member sees the runs of their workspace only'
);
select results_eq(
  $$ select id from public.hook_events $$,
  $$ select hook_event_a from fixture $$,
  'a member sees the timeline of their workspace runs only'
);
select is_empty($$ select id from public.cli_installs $$, 'install tokens stay invisible to members');
reset role;

-- run_participants and record_run_view
select has_table('public', 'run_participants', 'run_participants table exists');
select col_is_pk(
  'public', 'run_participants', array['run_id', 'user_id'],
  'a person joins a run at most once'
);
select fk_ok(
  'public', 'run_participants', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'participants stay inside the run workspace'
);
select is(
  public.record_run_view((select run_a from fixture), (select owner_b from fixture)),
  null,
  'someone outside the workspace cannot join its run'
);
select is(
  public.record_run_view((select run_a from fixture), (select driver_a from fixture)),
  'driver',
  'a member joins a run with their workspace role'
);
select is(
  public.record_run_view((select run_a from fixture), (select driver_a from fixture)),
  'driver',
  'viewing again keeps the same role'
);
select results_eq(
  $$
    select e.name, e.actor_id, e.props
    from public.events e join fixture f on e.run_id = f.run_a
  $$,
  $$
    select 'participant_joined'::text, driver_a, '{"role": "driver", "view": "timeline"}'::jsonb
    from fixture
  $$,
  'participant_joined is recorded once, on the first view'
);

-- run_comments and post_run_comment
select has_table('public', 'run_comments', 'run_comments table exists');
select columns_are(
  'public', 'run_comments',
  array['id', 'workspace_id', 'run_id', 'hook_event_id', 'author_id', 'body', 'created_at', 'audience'],
  'run_comments has exactly the expected columns'
);
select fk_ok(
  'public', 'run_comments', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'comments stay inside the run workspace'
);
select fk_ok(
  'public', 'run_comments', array['workspace_id', 'hook_event_id'],
  'public', 'hook_events', array['workspace_id', 'id'],
  'an anchored comment points at a timeline step in the same workspace'
);
select throws_ok(
  $$
    insert into public.run_comments (workspace_id, run_id, author_id, body)
    select workspace_a, run_a, owner_a, '' from fixture
  $$,
  '23514',
  null,
  'an empty comment is rejected'
);
select is(
  public.post_run_comment(
    (select run_a from fixture), (select owner_b from fixture), 'hello', null
  ),
  null,
  'someone outside the workspace cannot comment'
);
select isnt(
  public.post_run_comment(
    (select run_a from fixture), (select owner_a from fixture), 'Why this command?',
    (select hook_event_a from fixture)
  ),
  null,
  'a member comments on a timeline step'
);
select results_eq(
  $$
    select c.body, c.hook_event_id
    from public.run_comments c join fixture f on c.run_id = f.run_a
  $$,
  $$ select 'Why this command?'::text, hook_event_a from fixture $$,
  'the comment is stored with its anchor'
);
select results_eq(
  $$
    select e.props
    from public.events e join fixture f on e.run_id = f.run_a
    where e.name = 'comment_posted'
  $$,
  $$ values ('{"audience": "team"}'::jsonb) $$,
  'comment_posted is recorded with the team audience'
);
select throws_ok(
  $$
    select public.post_run_comment(
      (select run_a from fixture), (select owner_a from fixture), 'anchored elsewhere',
      gen_random_uuid()
    )
  $$,
  '23503',
  null,
  'a comment cannot be anchored to a step that is not in this workspace'
);

set local role authenticated;
select pg_temp.sign_in_as((select driver_a from fixture));
select results_eq(
  $$ select body from public.run_comments $$,
  $$ values ('Why this command?'::text) $$,
  'members read the comments of their runs'
);
select results_eq(
  $$ select user_id from public.run_participants $$,
  $$ select driver_a from fixture $$,
  'members see who joined their runs'
);
select pg_temp.sign_in_as((select owner_b from fixture));
select is_empty($$ select id from public.run_comments $$, 'other workspaces see no comments');
select throws_ok(
  $$ select public.post_run_comment(gen_random_uuid(), gen_random_uuid(), 'x', null) $$,
  '42501',
  null,
  'clients cannot call post_run_comment directly'
);
reset role;

select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'hook_events'
  ),
  'new timeline steps are broadcast through Supabase Realtime'
);
select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'run_comments'
  ),
  'new comments are broadcast through Supabase Realtime'
);

select * from finish();
rollback;
