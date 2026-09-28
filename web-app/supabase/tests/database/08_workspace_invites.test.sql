begin;
create extension if not exists pgtap with schema extensions;

select plan(20);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as invitee,
  gen_random_uuid() as stranger,
  encode(sha256('invite-token'::bytea), 'hex') as invite_hash,
  encode(sha256('expired-token'::bytea), 'hex') as expired_hash;

insert into auth.users (id)
select owner_a from fixture
union all select driver_a from fixture
union all select invitee from fixture
union all select stranger from fixture;

insert into public.workspaces (id, name) select workspace_a, 'Workspace A' from fixture;
insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all
select workspace_a, driver_a, 'driver' from fixture;

select has_table('public', 'workspace_invites', 'workspace_invites table exists');
select columns_are(
  'public', 'workspace_invites',
  array[
    'id', 'workspace_id', 'email', 'token_hash', 'invited_by',
    'created_at', 'expires_at', 'accepted_at', 'accepted_by'
  ],
  'workspace_invites has exactly the expected columns'
);
select col_is_unique('public', 'workspace_invites', 'token_hash', 'token_hash is unique');
select throws_ok(
  $$
    insert into public.workspace_invites (workspace_id, email, token_hash, invited_by)
    select workspace_a, 'Mixed@Example.com', invite_hash, owner_a from fixture
  $$,
  '23514',
  null,
  'invite emails are stored lowercase'
);
select throws_ok(
  $$
    insert into public.workspace_invites (workspace_id, email, token_hash, invited_by)
    select workspace_a, 'a@example.com', 'raw-token', owner_a from fixture
  $$,
  '23514',
  null,
  'only a SHA-256 digest of the invite token can be stored'
);

-- create_workspace_invite
select is(
  public.create_workspace_invite(
    (select workspace_a from fixture), (select driver_a from fixture),
    'friend@example.com', (select invite_hash from fixture)
  ),
  null,
  'a driver cannot invite'
);
select isnt(
  public.create_workspace_invite(
    (select workspace_a from fixture), (select owner_a from fixture),
    'Friend@Example.com', (select invite_hash from fixture)
  ),
  null,
  'an owner can invite'
);
select results_eq(
  $$
    select i.email, i.invited_by, i.expires_at > now() + interval '6 days'
    from public.workspace_invites i join fixture f on i.workspace_id = f.workspace_a
  $$,
  $$ select 'friend@example.com'::text, owner_a, true from fixture $$,
  'the invite stores a lowercase email, the inviter and a 7-day expiry'
);
select results_eq(
  $$
    select e.name, e.actor_id, e.props
    from public.events e join fixture f on e.workspace_id = f.workspace_a
  $$,
  $$ select 'invite_sent'::text, owner_a, '{"kind": "team"}'::jsonb from fixture $$,
  'sending a team invite records invite_sent'
);

insert into public.workspace_invites (workspace_id, email, token_hash, invited_by, expires_at)
select workspace_a, 'friend@example.com', expired_hash, owner_a, now() - interval '1 minute'
from fixture;

-- accept_workspace_invite
select is(
  public.accept_workspace_invite(
    (select invite_hash from fixture), (select stranger from fixture), 'stranger@example.com'
  ),
  null,
  'an invite cannot be accepted with a different email'
);
select is(
  public.accept_workspace_invite(
    (select expired_hash from fixture), (select invitee from fixture), 'friend@example.com'
  ),
  null,
  'an expired invite cannot be accepted'
);
select is(
  public.accept_workspace_invite(
    encode(sha256('unknown'::bytea), 'hex'), (select invitee from fixture), 'friend@example.com'
  ),
  null,
  'an unknown invite cannot be accepted'
);
select is(
  public.accept_workspace_invite(
    (select invite_hash from fixture), (select invitee from fixture), 'FRIEND@example.com'
  ),
  (select workspace_a from fixture),
  'the invited email accepts the invite regardless of letter case'
);
select results_eq(
  $$
    select m.role from public.workspace_members m
    join fixture f on m.workspace_id = f.workspace_a and m.user_id = f.invitee
  $$,
  $$ values ('driver'::text) $$,
  'accepting a team invite makes the user a driver'
);
select results_eq(
  $$
    select i.accepted_by from public.workspace_invites i
    join fixture f on i.token_hash = f.invite_hash
  $$,
  $$ select invitee from fixture $$,
  'the invite records who accepted it'
);
select results_eq(
  $$
    select e.name, e.actor_id, e.props
    from public.events e join fixture f on e.workspace_id = f.workspace_a
    where e.name = 'invite_accepted'
  $$,
  $$ select 'invite_accepted'::text, invitee, '{"kind": "team"}'::jsonb from fixture $$,
  'accepting a team invite records invite_accepted'
);
select is(
  public.accept_workspace_invite(
    (select invite_hash from fixture), (select invitee from fixture), 'friend@example.com'
  ),
  null,
  'an invite can be accepted only once'
);

set local role authenticated;
select throws_ok(
  $$ select public.create_workspace_invite(gen_random_uuid(), gen_random_uuid(), 'a@b.co', 'x') $$,
  '42501',
  null,
  'clients cannot call create_workspace_invite'
);
select throws_ok(
  $$ select public.accept_workspace_invite('x', gen_random_uuid(), 'a@b.co') $$,
  '42501',
  null,
  'clients cannot call accept_workspace_invite'
);
select is_empty($$ select id from public.workspace_invites $$, 'clients cannot read invites');
reset role;

select * from finish();
rollback;
