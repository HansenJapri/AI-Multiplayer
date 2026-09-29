begin;
create extension if not exists pgtap with schema extensions;

select plan(23);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as workspace_b,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as outsider;

-- The tests read fixture ids while acting as client roles.
grant select on fixture to anon, authenticated;

insert into auth.users (id)
select owner_a from fixture
union all select driver_a from fixture
union all select outsider from fixture;

insert into public.workspaces (id, name)
select workspace_a, 'Workspace A' from fixture
union all
select workspace_b, 'Workspace B' from fixture;

-- Lets the tests act as a signed-in user the way PostgREST does.
create function pg_temp.sign_in_as(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select null::void;
$$;

select has_table('public', 'workspace_members', 'workspace_members table exists');
select columns_are(
  'public', 'workspace_members', array['workspace_id', 'user_id', 'role', 'created_at'],
  'workspace_members has exactly the expected columns'
);
select col_is_pk(
  'public', 'workspace_members', array['workspace_id', 'user_id'],
  'a user is a member of a workspace at most once'
);
select fk_ok(
  'public', 'workspace_members', 'workspace_id', 'public', 'workspaces', 'id',
  'workspace_id references workspaces'
);
select fk_ok(
  'public', 'workspace_members', 'user_id', 'public', 'profiles', 'id',
  'user_id references profiles'
);
select col_not_null('public', 'workspace_members', 'role', 'role is required');
select col_has_default('public', 'workspace_members', 'created_at', 'created_at is set by default');

select lives_ok(
  $$
    insert into public.workspace_members (workspace_id, user_id, role)
    select workspace_a, owner_a, 'owner' from fixture
    union all
    select workspace_a, driver_a, 'driver' from fixture
  $$,
  'owners and drivers can be added'
);
select throws_ok(
  $$ insert into public.workspace_members (workspace_id, user_id, role) select workspace_b, outsider, 'guest' from fixture $$,
  '23514',
  null,
  'guest is not a workspace role; guests are scoped to a single run'
);

-- create_workspace_with_owner
select function_returns(
  'public', 'create_workspace_with_owner', array['text', 'uuid'], 'uuid',
  'create_workspace_with_owner(name, owner_id) returns the new workspace id'
);
select isnt(
  public.create_workspace_with_owner('Created Workspace', (select outsider from fixture)),
  null,
  'a workspace is created'
);
select results_eq(
  $$
    select w.name, m.role
    from public.workspaces w
    join public.workspace_members m on m.workspace_id = w.id
    join fixture f on m.user_id = f.outsider
  $$,
  $$ values ('Created Workspace'::text, 'owner'::text) $$,
  'the creator becomes the only owner of the new workspace'
);

-- Row level security for signed-in members
set local role authenticated;

select pg_temp.sign_in_as((select owner_a from fixture));
select results_eq(
  $$ select id from public.workspaces $$,
  $$ select workspace_a from fixture $$,
  'a member sees only the workspaces they belong to'
);
select results_eq(
  $$ select user_id from public.workspace_members order by role $$,
  $$ select driver_a from fixture union all select owner_a from fixture $$,
  'a member sees the member list of their own workspace'
);
select throws_ok(
  $$ insert into public.workspace_members (workspace_id, user_id, role) values (gen_random_uuid(), gen_random_uuid(), 'owner') $$,
  '42501',
  null,
  'members cannot add memberships directly'
);
-- Without an UPDATE policy the row is invisible to UPDATE, so nothing changes and no error is raised.
select lives_ok($$ update public.workspaces set name = 'Renamed' $$, 'an update by a member runs');
select results_eq(
  $$ select name from public.workspaces $$,
  $$ values ('Workspace A'::text) $$,
  'members cannot rename workspaces directly'
);

select pg_temp.sign_in_as((select outsider from fixture));
select results_eq(
  $$ select name from public.workspaces $$,
  $$ values ('Created Workspace'::text) $$,
  'a user outside workspace A does not see it'
);
select results_eq(
  $$ select count(*)::int from public.workspace_members $$,
  $$ values (1) $$,
  'a user outside workspace A does not see its members'
);

reset role;
select set_config('request.jwt.claims', '', true);

set local role anon;
select is_empty($$ select id from public.workspaces $$, 'anon still sees no workspaces');
select is_empty($$ select user_id from public.workspace_members $$, 'anon sees no memberships');
reset role;

set local role authenticated;
select throws_ok(
  $$ select public.create_workspace_with_owner('x', gen_random_uuid()) $$,
  '42501',
  null,
  'authenticated users cannot call create_workspace_with_owner'
);
reset role;

select has_function(
  'private', 'is_workspace_member', array['uuid'],
  'the membership check used by policies lives outside the exposed public schema'
);
select * from finish();
rollback;
