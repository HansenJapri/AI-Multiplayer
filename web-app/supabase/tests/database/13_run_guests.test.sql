begin;
create extension if not exists pgtap with schema extensions;

select plan(47);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as workspace_b,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as driver_a,
  gen_random_uuid() as owner_b,
  gen_random_uuid() as client,
  gen_random_uuid() as other_client,
  gen_random_uuid() as install_a,
  gen_random_uuid() as run_a,
  gen_random_uuid() as other_run_a,
  gen_random_uuid() as run_b,
  gen_random_uuid() as hook_event_a,
  gen_random_uuid() as other_hook_event_a;

grant select on fixture to anon, authenticated;

insert into auth.users (id, email)
select owner_a, 'owner@agency.example' from fixture
union all select driver_a, 'driver@agency.example' from fixture
union all select owner_b, 'owner@other-agency.example' from fixture
union all select client, 'buyer@client.example' from fixture
union all select other_client, 'someone@elsewhere.example' from fixture;

insert into public.workspaces (id, name)
select workspace_a, 'Agency A' from fixture
union all select workspace_b, 'Agency B' from fixture;

insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture
union all select workspace_a, driver_a, 'driver' from fixture
union all select workspace_b, owner_b, 'owner' from fixture;

insert into public.cli_installs (id, workspace_id, user_id, token_hash)
select install_a, workspace_a, driver_a, encode(sha256('token-a'::bytea), 'hex') from fixture;

insert into public.runs (id, workspace_id, claude_session_id)
select run_a, workspace_a, 'session-a' from fixture
union all select other_run_a, workspace_a, 'session-a2' from fixture
union all select run_b, workspace_b, 'session-b' from fixture;

insert into public.hook_events (id, workspace_id, run_id, cli_install_id, hook_event_name, payload)
select hook_event_a, workspace_a, run_a, install_a, 'PreToolUse', '{"tool_name": "Bash"}'::jsonb
from fixture
union all
select other_hook_event_a, workspace_a, other_run_a, install_a, 'PreToolUse', '{}'::jsonb
from fixture;

insert into public.run_checkpoints (workspace_id, run_id, cli_install_id, sequence, commit_sha, uploaded_at)
select workspace_a, run_a, install_a, 1, repeat('a', 40), now() from fixture;

create function pg_temp.sign_in_as(user_id uuid) returns void
language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', user_id, 'role', 'authenticated')::text, true);
  select null::void;
$$;

-- Schema
select has_table('public', 'run_guest_invites', 'run_guest_invites table exists');
select has_table('public', 'run_guests', 'run_guests table exists');
select col_is_pk('public', 'run_guests', array['run_id', 'user_id'], 'a client joins a run at most once');
select fk_ok(
  'public', 'run_guests', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'guest access stays inside the run workspace'
);
select fk_ok(
  'public', 'run_guest_invites', array['workspace_id', 'run_id'],
  'public', 'runs', array['workspace_id', 'id'],
  'a guest invite points at a run in its workspace'
);
select col_default_is(
  'public', 'run_comments', 'audience', 'team'::text,
  'comments are internal to the team unless marked for the client'
);
select throws_ok(
  $$
    insert into public.run_comments (workspace_id, run_id, author_id, body, audience)
    select workspace_a, run_a, owner_a, 'hi', 'everyone' from fixture
  $$,
  '23514',
  null,
  'a comment audience is team or client'
);
select throws_ok(
  $$
    insert into public.run_guest_invites (workspace_id, run_id, email, token_hash, invited_by)
    select workspace_a, run_a, 'buyer@client.example', 'not-a-digest', owner_a from fixture
  $$,
  '23514',
  null,
  'only a SHA-256 digest of the invite token is stored'
);

-- create_run_guest_invite
select is(
  public.create_run_guest_invite(
    (select run_a from fixture), (select owner_b from fixture), 'buyer@client.example',
    encode(sha256('stranger-invite'::bytea), 'hex')
  ),
  null,
  'someone outside the workspace cannot invite a guest to its run'
);
select is(
  public.create_run_guest_invite(
    gen_random_uuid(), (select owner_a from fixture), 'buyer@client.example',
    encode(sha256('missing-run'::bytea), 'hex')
  ),
  null,
  'nobody can invite a guest to a run that does not exist'
);
select isnt(
  public.create_run_guest_invite(
    (select run_a from fixture), (select driver_a from fixture), 'Buyer@Client.example',
    encode(sha256('guest-invite'::bytea), 'hex')
  ),
  null,
  'a driver invites a client to a run'
);
select results_eq(
  $$
    select email, invited_by from public.run_guest_invites
    where token_hash = encode(sha256('guest-invite'::bytea), 'hex')
  $$,
  $$ select 'buyer@client.example'::text, driver_a from fixture $$,
  'the invite is stored for the lower-cased email'
);
select results_eq(
  $$
    select e.name, e.actor_id, e.props
    from public.events e join fixture f on e.run_id = f.run_a
    where e.name in ('guest_invited', 'invite_sent')
    order by e.name
  $$,
  $$
    select 'guest_invited'::text, driver_a, '{}'::jsonb from fixture
    union all
    select 'invite_sent'::text, driver_a, '{"kind": "guest"}'::jsonb from fixture
  $$,
  'guest_invited and invite_sent{kind: guest} are recorded on the run'
);

-- accept_run_guest_invite
select is(
  public.accept_run_guest_invite(
    encode(sha256('guest-invite'::bytea), 'hex'), (select other_client from fixture),
    'someone@elsewhere.example'
  ),
  null,
  'an invite cannot be accepted with another email address'
);
select is(
  public.accept_run_guest_invite(
    encode(sha256('guest-invite'::bytea), 'hex'), (select client from fixture),
    'BUYER@client.example'
  ),
  (select run_a from fixture),
  'the invited client accepts and gets the run id back'
);
select is(
  public.accept_run_guest_invite(
    encode(sha256('guest-invite'::bytea), 'hex'), (select client from fixture),
    'buyer@client.example'
  ),
  null,
  'an invite works once'
);
select results_eq(
  $$ select g.workspace_id, g.user_id from public.run_guests g join fixture f on g.run_id = f.run_a $$,
  $$ select workspace_a, client from fixture $$,
  'the client is a guest of that run'
);
select results_eq(
  $$
    select e.actor_id, e.props from public.events e join fixture f on e.run_id = f.run_a
    where e.name = 'invite_accepted'
  $$,
  $$ select client, '{"kind": "guest"}'::jsonb from fixture $$,
  'invite_accepted{kind: guest} is recorded'
);

insert into public.run_guest_invites (workspace_id, run_id, email, token_hash, invited_by, expires_at)
select workspace_a, other_run_a, 'buyer@client.example',
  encode(sha256('expired-invite'::bytea), 'hex'), owner_a, now() - interval '1 minute'
from fixture;
select is(
  public.accept_run_guest_invite(
    encode(sha256('expired-invite'::bytea), 'hex'), (select client from fixture),
    'buyer@client.example'
  ),
  null,
  'an expired invite cannot be accepted'
);

-- record_run_view
select is(
  public.record_run_view((select run_a from fixture), (select client from fixture)),
  'guest',
  'a guest opens their run as a guest'
);
select is(
  public.record_run_view((select other_run_a from fixture), (select client from fixture)),
  null,
  'a guest cannot open any other run of the workspace'
);
select results_eq(
  $$
    select e.props from public.events e join fixture f on e.run_id = f.run_a and e.actor_id = f.client
    where e.name = 'participant_joined'
  $$,
  $$ values ('{"role": "guest", "view": "timeline"}'::jsonb) $$,
  'participant_joined is recorded with the guest role'
);

-- post_run_comment
select isnt(
  public.post_run_comment(
    (select run_a from fixture), (select driver_a from fixture), 'internal note', null, 'team'
  ),
  null,
  'a member posts an internal comment'
);
select isnt(
  public.post_run_comment(
    (select run_a from fixture), (select driver_a from fixture), 'for the client',
    (select hook_event_a from fixture), 'client'
  ),
  null,
  'a member posts a comment the client can read'
);
select isnt(
  public.post_run_comment(
    (select run_a from fixture), (select client from fixture), 'looks good', null, 'team'
  ),
  null,
  'a guest comments on their run'
);
select results_eq(
  $$
    select c.audience from public.run_comments c join fixture f on c.run_id = f.run_a
    where c.author_id = f.client
  $$,
  $$ values ('client'::text) $$,
  'a guest comment always goes to the client audience'
);
select is(
  public.post_run_comment(
    (select other_run_a from fixture), (select client from fixture), 'sneaky', null, 'client'
  ),
  null,
  'a guest cannot comment on another run'
);
select results_eq(
  $$
    select e.props from public.events e join fixture f on e.run_id = f.run_a
    where e.name = 'comment_posted'
    order by e.created_at, e.props::text
  $$,
  $$
    values ('{"audience": "client"}'::jsonb), ('{"audience": "client"}'::jsonb),
      ('{"audience": "team"}'::jsonb)
  $$,
  'comment_posted records the audience of each comment'
);

-- Guests can never steer, hold, or resume
select is(
  public.queue_steer_message((select run_a from fixture), (select client from fixture), 'do x'),
  null,
  'a guest cannot steer the agent'
);
select is(
  public.raise_run_hold((select run_a from fixture), (select client from fixture), 'stop'),
  false,
  'a guest cannot hold the run'
);
select is(
  public.approve_cli_device_login('ABCD-EFGH', (select client from fixture), (select workspace_a from fixture)),
  false,
  'a guest cannot connect a CLI to the workspace, so they can never resume its runs'
);

-- What a guest reads through row level security
set local role authenticated;
select pg_temp.sign_in_as((select client from fixture));
select results_eq(
  $$ select id from public.runs $$,
  $$ select run_a from fixture $$,
  'a guest sees their one run only'
);
select results_eq(
  $$ select id from public.hook_events $$,
  $$ select hook_event_a from fixture $$,
  'a guest sees the timeline of their run only'
);
select results_eq(
  $$ select body from public.run_comments order by body $$,
  $$ values ('for the client'::text), ('looks good'::text) $$,
  'a guest reads client comments only, never internal ones'
);
select results_eq(
  $$ select name from public.workspaces $$,
  $$ values ('Agency A'::text) $$,
  'a guest sees the name of the agency that shared the run'
);
select is_empty($$ select user_id from public.workspace_members $$, 'a guest cannot list the team');
select is_empty($$ select id from public.steer_messages $$, 'a guest cannot read steer messages');
select is_empty($$ select id from public.run_holds $$, 'a guest cannot read holds');
select is_empty($$ select id from public.run_checkpoints $$, 'a guest cannot read checkpoints');
select is_empty($$ select user_id from public.run_participants $$, 'a guest cannot list participants');
select is_empty($$ select id from public.events $$, 'a guest cannot read product events');
select is_empty($$ select id from public.run_guest_invites $$, 'invite digests stay server-side');
select results_eq(
  $$ select run_id from public.run_guests $$,
  $$ select run_a from fixture $$,
  'a guest sees their own guest access'
);
select throws_ok(
  $$ select public.create_run_guest_invite(gen_random_uuid(), gen_random_uuid(), 'a@b.c', repeat('0', 64)) $$,
  '42501',
  null,
  'clients cannot call create_run_guest_invite directly'
);

select pg_temp.sign_in_as((select driver_a from fixture));
select results_eq(
  $$ select user_id from public.run_guests $$,
  $$ select client from fixture $$,
  'members see which clients can open their runs'
);
select results_eq(
  $$ select count(*)::integer from public.run_comments $$,
  $$ values (3) $$,
  'members read every comment, internal and client'
);

select pg_temp.sign_in_as((select owner_b from fixture));
select is_empty($$ select user_id from public.run_guests $$, 'other workspaces see no guests');
reset role;

select * from finish();
rollback;
