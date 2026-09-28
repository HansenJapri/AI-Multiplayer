begin;
create extension if not exists pgtap with schema extensions;

select plan(22);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as workspace_b,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as owner_b,
  encode(sha256('owner-a-token'::bytea), 'hex') as owner_token_hash,
  encode(sha256('driver-a-token'::bytea), 'hex') as driver_token_hash,
  encode(sha256('owner-b-token'::bytea), 'hex') as outsider_token_hash;

grant select on fixture to anon, authenticated, service_role;

insert into auth.users (id)
select owner_a from fixture union all select driver_a from fixture union all select owner_b from fixture;
insert into public.workspaces (id, name)
select workspace_a, 'A' from fixture union all select workspace_b, 'B' from fixture;
insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all select workspace_a, driver_a, 'driver' from fixture
union all select workspace_b, owner_b, 'owner' from fixture;
insert into public.cli_installs (workspace_id, user_id, token_hash)
select workspace_a, owner_a, owner_token_hash from fixture
union all select workspace_a, driver_a, driver_token_hash from fixture
union all select workspace_b, owner_b, outsider_token_hash from fixture;

select has_table('public', 'run_checkpoints', 'run_checkpoints table exists');
select col_is_unique(
  'public', 'run_checkpoints', array['run_id', 'sequence'],
  'each run numbers its checkpoints once'
);
select fk_ok(
  'public', 'run_checkpoints', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'checkpoints stay inside the run workspace'
);
select throws_ok(
  $$
    insert into public.run_checkpoints (workspace_id, run_id, cli_install_id, sequence, commit_sha)
    select workspace_a, gen_random_uuid(), gen_random_uuid(), 1, 'not-a-sha' from fixture
  $$,
  '23514',
  null,
  'only a 40-character git commit hash is accepted'
);

select ok(
  exists (select 1 from storage.buckets where id = 'checkpoints' and not public),
  'checkpoint files go to a private storage bucket'
);

-- Creating checkpoints
select is(
  public.create_run_checkpoint(
    encode(sha256('unknown'::bytea), 'hex'), 'session-a', repeat('a', 40)
  ),
  null,
  'an unknown install token cannot create a checkpoint'
);

create temp table first_checkpoint as
select public.create_run_checkpoint(
  (select owner_token_hash from fixture), 'session-a', repeat('a', 40)
) as result;
grant select on first_checkpoint to service_role;

select is(
  (select (result ->> 'sequence')::int from first_checkpoint),
  1,
  'the first checkpoint of a run is step 1'
);
select ok(
  (select result ->> 'run_id' is not null and result ->> 'checkpoint_id' is not null from first_checkpoint),
  'creating a checkpoint returns its id and its run, creating the run if needed'
);
select is(
  (
    select (public.create_run_checkpoint(
      (select owner_token_hash from fixture), 'session-a', repeat('b', 40)
    ) ->> 'sequence')::int
  ),
  2,
  'the next checkpoint of the same session is step 2'
);

-- Completing uploads
select is(
  public.complete_run_checkpoint(
    (select driver_token_hash from fixture),
    (select (result ->> 'checkpoint_id')::uuid from first_checkpoint)
  ),
  false,
  'only the install that created a checkpoint can mark its upload complete'
);
select is(
  public.complete_run_checkpoint(
    (select owner_token_hash from fixture),
    (select (result ->> 'checkpoint_id')::uuid from first_checkpoint)
  ),
  true,
  'the creating install marks its upload complete'
);

-- Resolving a checkpoint to resume
select is(
  public.resolve_checkpoint_for_resume(
    (select outsider_token_hash from fixture),
    (select (result ->> 'run_id')::uuid from first_checkpoint),
    null
  ),
  null,
  'someone from another workspace cannot resume the run'
);
select is(
  (
    public.resolve_checkpoint_for_resume(
      (select driver_token_hash from fixture),
      (select (result ->> 'run_id')::uuid from first_checkpoint),
      null
    ) ->> 'sequence'
  )::int,
  1,
  'without a step, resume uses the latest uploaded checkpoint'
);
select is(
  public.resolve_checkpoint_for_resume(
    (select driver_token_hash from fixture),
    (select (result ->> 'run_id')::uuid from first_checkpoint),
    2
  ),
  null,
  'a checkpoint whose upload is not complete cannot be resumed'
);
select results_eq(
  $$
    select
      public.resolve_checkpoint_for_resume(
        (select driver_token_hash from fixture),
        (select (result ->> 'run_id')::uuid from first_checkpoint),
        1
      ) - 'checkpoint_id' - 'run_id'
  $$,
  $$
    values (
      jsonb_build_object(
        'sequence', 1,
        'commit_sha', repeat('a', 40),
        'claude_session_id', 'session-a',
        'workspace_id', (select workspace_a from fixture)
      )
    )
  $$,
  'resume returns the commit and session to continue from'
);
select results_eq(
  $$
    select e.actor_id, e.props
    from public.events e join fixture f on e.workspace_id = f.workspace_a
    where e.name = 'checkpoint_resume'
    order by e.created_at
    limit 1
  $$,
  $$
    select driver_a, '{"from_step": 1, "fraction_reexecuted": 0.5}'::jsonb from fixture
  $$,
  'resuming records checkpoint_resume with the step and the share of steps redone'
);

-- A former member loses resume access
delete from public.workspace_members m
using fixture f
where m.workspace_id = f.workspace_a and m.user_id = f.driver_a;
select is(
  public.resolve_checkpoint_for_resume(
    (select driver_token_hash from fixture),
    (select (result ->> 'run_id')::uuid from first_checkpoint),
    null
  ),
  null,
  'an install whose user left the workspace cannot resume its runs'
);

-- Access control
set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object('sub', (select owner_a from fixture), 'role', 'authenticated')::text,
  true
);
select is(
  (select count(*)::int from public.run_checkpoints),
  2,
  'members see the checkpoints of their runs'
);
select throws_ok(
  $$ select public.create_run_checkpoint('x', 'y', repeat('a', 40)) $$,
  '42501',
  null,
  'clients cannot create checkpoints directly'
);
select is_empty(
  $$ select id from storage.objects where bucket_id = 'checkpoints' $$,
  'clients cannot list checkpoint files'
);
reset role;

set local role service_role;
select lives_ok(
  $$
    select public.resolve_checkpoint_for_resume(
      (select owner_token_hash from pg_temp.fixture),
      (select (result ->> 'run_id')::uuid from pg_temp.first_checkpoint),
      null
    )
  $$,
  'the server role can resolve a resume'
);
select lives_ok(
  $$ select public.create_run_checkpoint((select owner_token_hash from pg_temp.fixture), 'session-z', repeat('c', 40)) $$,
  'the server role can create a checkpoint'
);
reset role;

select * from finish();
rollback;
