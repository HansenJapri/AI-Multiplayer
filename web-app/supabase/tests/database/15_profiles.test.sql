begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

create temp table fixture as
select gen_random_uuid() as alice, gen_random_uuid() as bob, gen_random_uuid() as workspace_a;

grant select on fixture to anon, authenticated;

create function pg_temp.sign_in_as(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select null::void;
$$;

-- Schema
select has_table('public', 'profiles', 'profiles table exists');
select col_is_pk('public', 'profiles', 'id', 'a profile is keyed by the account id');
select fk_ok('public', 'profiles', 'id', 'auth', 'users', 'id', 'every profile belongs to an account');

-- One profile per account, kept in step with auth.users
insert into auth.users (id, email)
select alice, 'Alice@Agency.Example' from fixture
union all select bob, 'bob@agency.example' from fixture;

select results_eq(
  $$ select p.email from public.profiles p join fixture f on p.id = f.alice $$,
  $$ values ('alice@agency.example'::text) $$,
  'signing up creates a profile with the lower-cased email'
);

update auth.users set email = 'alice@new.example' where id = (select alice from fixture);
select results_eq(
  $$ select p.email from public.profiles p join fixture f on p.id = f.alice $$,
  $$ values ('alice@new.example'::text) $$,
  'changing the account email updates the profile'
);

-- Every reference to a person goes through profiles, so the public schema is one connected graph
select is_empty(
  $$
    select con.conrelid::regclass::text || '.' || a.attname
    from pg_constraint con
    join lateral unnest(con.conkey) k(attnum) on true
    join pg_attribute a on a.attrelid = con.conrelid and a.attnum = k.attnum
    where con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
      and con.connamespace in ('public'::regnamespace, 'private'::regnamespace)
      and con.conrelid <> 'public.profiles'::regclass
  $$,
  'only profiles points at auth.users'
);
select fk_ok('public', 'workspace_members', 'user_id', 'public', 'profiles', 'id', 'members are profiles');
select fk_ok('public', 'events', 'actor_id', 'public', 'profiles', 'id', 'event actors are profiles');
select fk_ok('public', 'run_comments', 'author_id', 'public', 'profiles', 'id', 'comment authors are profiles');
select fk_ok('public', 'run_guests', 'user_id', 'public', 'profiles', 'id', 'guests are profiles');
select fk_ok('public', 'cli_installs', 'user_id', 'public', 'profiles', 'id', 'CLI installs belong to profiles');

-- Row level security: a person reads their own profile only
insert into public.workspaces (id, name) select workspace_a, 'Agency A' from fixture;

set local role authenticated;
select pg_temp.sign_in_as((select alice from fixture));
select results_eq(
  $$ select email from public.profiles $$,
  $$ values ('alice@new.example'::text) $$,
  'a person reads their own profile only'
);
select throws_ok(
  $$ update public.profiles set email = 'x@y.z' $$,
  '42501',
  null,
  'profiles are not written from the client'
);
reset role;

set local role anon;
select is_empty($$ select id from public.profiles $$, 'anonymous visitors read no profiles');
reset role;

select * from finish();
rollback;
