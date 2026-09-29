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
  gen_random_uuid() as run_a,
  gen_random_uuid() as client;

grant select on fixture to anon, authenticated;

insert into auth.users (id)
select owner_a from fixture
union all select driver_a from fixture
union all select owner_b from fixture
union all select client from fixture;

insert into public.workspaces (id, name)
select workspace_a, 'Agency A' from fixture
union all select workspace_b, 'Agency B' from fixture;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all select workspace_a, driver_a, 'driver' from fixture
union all select workspace_b, owner_b, 'owner' from fixture;

insert into public.runs (id, workspace_id, claude_session_id)
select run_a, workspace_a, 'session-a' from fixture;

insert into public.run_guests (workspace_id, run_id, user_id, invited_by)
select workspace_a, run_a, client, owner_a from fixture;

create function pg_temp.sign_in_as(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select null::void;
$$;

-- Schema
select has_table('public', 'deposits', 'deposits table exists');
select throws_ok(
  $$
    insert into public.deposits (workspace_id, plan, seats, amount_cents, provider, started_by)
    select workspace_a, 'enterprise', 1, 100, 'manual', owner_a from fixture
  $$,
  '23514',
  null,
  'a deposit is for the team or agency plan'
);
select throws_ok(
  $$
    insert into public.deposits (workspace_id, plan, seats, amount_cents, provider, started_by)
    select workspace_a, 'team', 1, 0, 'manual', owner_a from fixture
  $$,
  '23514',
  null,
  'a deposit has a positive amount'
);
select throws_ok(
  $$
    insert into public.deposits (workspace_id, plan, seats, amount_cents, provider, started_by, status)
    select workspace_a, 'team', 1, 3000, 'manual', owner_a, 'paid' from fixture
  $$,
  '23514',
  null,
  'a paid deposit always carries when it was paid'
);

-- start_deposit
select is(
  public.start_deposit(
    (select workspace_a from fixture), (select driver_a from fixture), 'team', 2, 6000, 'USD', 'manual'
  ),
  null,
  'a driver cannot start a deposit for the workspace'
);
select is(
  public.start_deposit(
    (select workspace_a from fixture), (select owner_b from fixture), 'team', 2, 6000, 'USD', 'manual'
  ),
  null,
  'someone outside the workspace cannot start a deposit for it'
);

create temp table started as
select public.start_deposit(
  (select workspace_a from fixture), (select owner_a from fixture), 'team', 2, 6000, 'USD', 'manual'
) as deposit_id;
grant select on started to authenticated;

select isnt((select deposit_id from started), null, 'an owner starts a deposit');
select results_eq(
  $$
    select d.plan, d.seats, d.amount_cents, d.currency, d.provider, d.status, d.paid_at is null
    from public.deposits d join started s on d.id = s.deposit_id
  $$,
  $$ values ('team'::text, 2, 6000, 'USD'::text, 'manual'::text, 'pending'::text, true) $$,
  'the deposit is pending with the chosen plan, seats and amount'
);
select results_eq(
  $$
    select e.actor_id, e.props from public.events e join fixture f on e.workspace_id = f.workspace_a
    where e.name = 'deposit_started'
  $$,
  $$
    select owner_a,
      '{"plan": "team", "seats": 2, "amount_cents": 6000, "currency": "USD", "provider": "manual"}'::jsonb
    from fixture
  $$,
  'deposit_started is recorded with the plan, amount and provider'
);

-- complete_deposit
select is(
  public.complete_deposit(gen_random_uuid(), 'wire-1'),
  false,
  'an unknown deposit cannot be completed'
);
select is(
  public.complete_deposit((select deposit_id from started), 'wire-1'),
  true,
  'a pending deposit is completed'
);
select results_eq(
  $$
    select d.status, d.provider_reference, d.paid_at is not null
    from public.deposits d join started s on d.id = s.deposit_id
  $$,
  $$ values ('paid'::text, 'wire-1'::text, true) $$,
  'the completed deposit is paid with the provider reference'
);
select is(
  public.complete_deposit((select deposit_id from started), 'wire-2'),
  false,
  'a deposit is completed once'
);
select results_eq(
  $$
    select e.actor_id, e.props from public.events e join fixture f on e.workspace_id = f.workspace_a
    where e.name = 'deposit_completed'
  $$,
  $$
    select owner_a,
      '{"plan": "team", "seats": 2, "amount_cents": 6000, "currency": "USD", "provider": "manual"}'::jsonb
    from fixture
  $$,
  'deposit_completed is recorded once, credited to the owner who started it'
);

-- What people read through row level security
set local role authenticated;
select pg_temp.sign_in_as((select owner_a from fixture));
select results_eq(
  $$ select status from public.deposits $$,
  $$ values ('paid'::text) $$,
  'an owner sees the deposits of their workspace'
);
select pg_temp.sign_in_as((select driver_a from fixture));
select results_eq(
  $$ select status from public.deposits $$,
  $$ values ('paid'::text) $$,
  'a driver sees the deposits of their workspace'
);
select pg_temp.sign_in_as((select owner_b from fixture));
select is_empty($$ select id from public.deposits $$, 'other workspaces see no deposits');
select pg_temp.sign_in_as((select client from fixture));
select is_empty($$ select id from public.deposits $$, 'a client guest never sees deposits');
select throws_ok(
  $$
    insert into public.deposits (workspace_id, plan, seats, amount_cents, provider, started_by)
    select workspace_a, 'team', 1, 3000, 'manual', owner_a from fixture
  $$,
  '42501',
  null,
  'clients cannot write deposits'
);
select throws_ok(
  $$ select public.start_deposit(gen_random_uuid(), gen_random_uuid(), 'team', 1, 3000, 'USD', 'manual') $$,
  '42501',
  null,
  'clients cannot call start_deposit directly'
);
select throws_ok(
  $$ select public.complete_deposit(gen_random_uuid(), 'x') $$,
  '42501',
  null,
  'clients cannot mark a deposit paid'
);
reset role;

select ok(
  exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'deposits'
  ) is false,
  'deposits are not broadcast'
);

select * from finish();
rollback;
