-- Device-code login for the `aim` CLI (the OAuth device flow shape): the CLI shows a short user
-- code, the user approves it in the browser for one workspace, and the CLI then claims an install
-- token. Rows exist before any workspace is chosen, so the table lives in the private schema the
-- Data API does not expose instead of in public (where every table must carry workspace_id).
create table private.cli_device_logins (
  id uuid primary key default gen_random_uuid(),
  device_code_hash text not null unique check (device_code_hash ~ '^[0-9a-f]{64}$'),
  -- Cleared when a login expires unclaimed, so the short code can be handed out again.
  user_code text check (user_code ~ '^[A-Z2-9]{4}-[A-Z2-9]{4}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '10 minutes',
  workspace_id uuid references public.workspaces (id),
  approved_by uuid references auth.users (id),
  approved_at timestamptz,
  claimed_at timestamptz,
  check ((approved_at is null) = (approved_by is null)),
  check ((approved_at is null) = (workspace_id is null)),
  check (claimed_at is null or approved_at is not null)
);

create unique index cli_device_logins_unclaimed_user_code_key
  on private.cli_device_logins (user_code)
  where claimed_at is null and user_code is not null;
create index cli_device_logins_workspace_id_idx on private.cli_device_logins (workspace_id);
create index cli_device_logins_approved_by_idx on private.cli_device_logins (approved_by);

grant usage on schema private to service_role;
grant select, insert, update on private.cli_device_logins to service_role;

create function public.start_cli_device_login(p_device_code_hash text, p_user_code text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update private.cli_device_logins
  set user_code = null
  where user_code = p_user_code and claimed_at is null and expires_at <= now();

  insert into private.cli_device_logins (device_code_hash, user_code)
  values (p_device_code_hash, p_user_code);
end;
$$;

-- True when the login was pending and the user may use the workspace; false otherwise.
create function public.approve_cli_device_login(
  p_user_code text,
  p_user_id uuid,
  p_workspace_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_user_id
  ) then
    return false;
  end if;

  update private.cli_device_logins
  set workspace_id = p_workspace_id, approved_by = p_user_id, approved_at = now()
  where user_code = upper(p_user_code)
    and approved_at is null
    and claimed_at is null
    and expires_at > now();

  return found;
end;
$$;

-- Registers the install for the approving user and returns its workspace id, or null when the
-- login is unknown, not yet approved, expired or already claimed.
create function public.claim_cli_device_login(p_device_code_hash text, p_install_token_hash text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  approved_login private.cli_device_logins%rowtype;
begin
  select * into approved_login
  from private.cli_device_logins
  where device_code_hash = p_device_code_hash
    and approved_at is not null
    and claimed_at is null
    and expires_at > now()
  for update;

  if not found then
    return null;
  end if;

  insert into public.cli_installs (workspace_id, user_id, token_hash)
  values (approved_login.workspace_id, approved_login.approved_by, p_install_token_hash);

  update private.cli_device_logins set claimed_at = now() where id = approved_login.id;

  return approved_login.workspace_id;
end;
$$;

create function public.cli_device_login_status(p_device_code_hash text)
returns text
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(
    (
      select case
        when claimed_at is not null then 'claimed'
        when expires_at <= now() then 'expired'
        when approved_at is not null then 'approved'
        else 'pending'
      end
      from private.cli_device_logins
      where device_code_hash = p_device_code_hash
    ),
    'unknown'
  );
$$;

revoke execute on function public.start_cli_device_login(text, text) from public, anon, authenticated;
revoke execute on function public.approve_cli_device_login(text, uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.claim_cli_device_login(text, text) from public, anon, authenticated;
revoke execute on function public.cli_device_login_status(text) from public, anon, authenticated;
grant execute on function public.start_cli_device_login(text, text) to service_role;
grant execute on function public.approve_cli_device_login(text, uuid, uuid) to service_role;
grant execute on function public.claim_cli_device_login(text, text) to service_role;
grant execute on function public.cli_device_login_status(text) to service_role;
