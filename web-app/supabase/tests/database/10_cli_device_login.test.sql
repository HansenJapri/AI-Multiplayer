begin;
create extension if not exists pgtap with schema extensions;

select plan(17);

create temp table fixture as
select
  gen_random_uuid() as workspace_a,
  gen_random_uuid() as owner_a,
  gen_random_uuid() as outsider,
  encode(sha256('device-code'::bytea), 'hex') as device_hash,
  encode(sha256('expired-device-code'::bytea), 'hex') as expired_device_hash,
  encode(sha256('issued-install-token'::bytea), 'hex') as install_token_hash;

insert into auth.users (id) select owner_a from fixture union all select outsider from fixture;
insert into public.workspaces (id, name) select workspace_a, 'Workspace A' from fixture;
insert into public.workspace_members (workspace_id, user_id, role)
select workspace_a, owner_a, 'owner' from fixture;

select has_table('private', 'cli_device_logins', 'device logins live outside the exposed schema');

select lives_ok(
  $$ select public.start_cli_device_login((select device_hash from fixture), 'ABCD-EFGH') $$,
  'a CLI starts a device login with a device code hash and a short user code'
);
select throws_ok(
  $$ select public.start_cli_device_login(encode(sha256('other'::bytea), 'hex'), 'ABCD-EFGH') $$,
  '23505',
  null,
  'two pending logins cannot share a user code'
);
select is(
  public.claim_cli_device_login((select device_hash from fixture), (select install_token_hash from fixture)),
  null,
  'nothing can be claimed before the user approves'
);

select is(
  public.approve_cli_device_login('ABCD-EFGH', (select outsider from fixture), (select workspace_a from fixture)),
  false,
  'only a member of the workspace can approve a login into it'
);
select is(
  public.approve_cli_device_login('abcd-efgh', (select owner_a from fixture), (select workspace_a from fixture)),
  true,
  'a member approves with the user code, in any letter case'
);
select is(
  public.approve_cli_device_login('ABCD-EFGH', (select owner_a from fixture), (select workspace_a from fixture)),
  false,
  'an approved login cannot be approved again'
);

select is(
  public.claim_cli_device_login((select device_hash from fixture), (select install_token_hash from fixture)),
  (select workspace_a from fixture),
  'the CLI claims the approved login and gets the workspace id'
);
select results_eq(
  $$
    select i.workspace_id, i.user_id
    from public.cli_installs i join fixture f on i.token_hash = f.install_token_hash
  $$,
  $$ select workspace_a, owner_a from fixture $$,
  'claiming registers an install for the approving user in that workspace'
);
select is(
  public.claim_cli_device_login((select device_hash from fixture), encode(sha256('second'::bytea), 'hex')),
  null,
  'a device login can be claimed only once'
);

insert into private.cli_device_logins (device_code_hash, user_code, expires_at)
select expired_device_hash, 'WXYZ-2345', now() - interval '1 second' from fixture;
select is(
  public.approve_cli_device_login('WXYZ-2345', (select owner_a from fixture), (select workspace_a from fixture)),
  false,
  'an expired login cannot be approved'
);
select lives_ok(
  $$ select public.start_cli_device_login(encode(sha256('reuse'::bytea), 'hex'), 'WXYZ-2345') $$,
  'the user code of an expired login can be reused'
);

select is(
  public.cli_device_login_status((select device_hash from fixture)),
  'claimed',
  'status reports a claimed login'
);
select is(
  public.cli_device_login_status((select expired_device_hash from fixture)),
  'expired',
  'status reports an expired login'
);
select is(
  public.cli_device_login_status(encode(sha256('never-started'::bytea), 'hex')),
  'unknown',
  'status reports an unknown device code'
);

set local role authenticated;
select throws_ok(
  $$ select public.approve_cli_device_login('ABCD-EFGH', gen_random_uuid(), gen_random_uuid()) $$,
  '42501',
  null,
  'clients cannot approve device logins directly'
);
select throws_ok(
  $$ select count(*) from private.cli_device_logins $$,
  '42501',
  null,
  'clients cannot read device logins'
);
reset role;

select * from finish();
rollback;
