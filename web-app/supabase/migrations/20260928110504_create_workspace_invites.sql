-- Team invites. The owner shares a link; only the SHA-256 digest of its token is stored, and the
-- person accepting must sign in with the invited email address.
create table public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  email text not null check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+$'),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id),
  check ((accepted_at is null) = (accepted_by is null))
);

create index workspace_invites_workspace_id_idx on public.workspace_invites (workspace_id);
create index workspace_invites_invited_by_idx on public.workspace_invites (invited_by);
create index workspace_invites_accepted_by_idx on public.workspace_invites (accepted_by);

alter table public.workspace_invites enable row level security;

-- Returns the invite id, or null when the inviter is not an owner of the workspace.
create function public.create_workspace_invite(
  p_workspace_id uuid,
  p_inviter_id uuid,
  p_email text,
  p_token_hash text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_invite_id uuid;
begin
  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_inviter_id and role = 'owner'
  ) then
    return null;
  end if;

  insert into public.workspace_invites (workspace_id, email, token_hash, invited_by)
  values (p_workspace_id, lower(p_email), p_token_hash, p_inviter_id)
  returning id into new_invite_id;

  insert into public.events (workspace_id, actor_id, name, props)
  values (p_workspace_id, p_inviter_id, 'invite_sent', '{"kind": "team"}');

  return new_invite_id;
end;
$$;

-- Returns the workspace id, or null when the invite is unknown, expired, already used, or was
-- sent to a different email address.
create function public.accept_workspace_invite(
  p_token_hash text,
  p_user_id uuid,
  p_user_email text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pending_invite public.workspace_invites%rowtype;
begin
  select * into pending_invite
  from public.workspace_invites
  where token_hash = p_token_hash
    and accepted_at is null
    and expires_at > now()
    and email = lower(p_user_email)
  for update;

  if not found then
    return null;
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (pending_invite.workspace_id, p_user_id, 'driver')
  on conflict (workspace_id, user_id) do nothing;

  update public.workspace_invites
  set accepted_at = now(), accepted_by = p_user_id
  where id = pending_invite.id;

  insert into public.events (workspace_id, actor_id, name, props)
  values (pending_invite.workspace_id, p_user_id, 'invite_accepted', '{"kind": "team"}');

  return pending_invite.workspace_id;
end;
$$;

revoke execute on function public.create_workspace_invite(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke execute on function public.accept_workspace_invite(text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_workspace_invite(uuid, uuid, text, text) to service_role;
grant execute on function public.accept_workspace_invite(text, uuid, text) to service_role;
