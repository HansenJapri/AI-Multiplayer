-- Client guests. A member shares one run with a client by an email-bound invite link. The guest
-- reads that run's timeline and the comments meant for the client, and comments back. Nothing
-- else: steering, holds, checkpoints and the CLI all still require workspace membership.

-- Comments are internal to the team unless a member marks them for the client.
alter table public.run_comments
  add column audience text not null default 'team' check (audience in ('team', 'client'));

create table public.run_guest_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  run_id uuid not null,
  email text not null check (email = lower(email) and email ~ '^[^@[:space:]]+@[^@[:space:]]+$'),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  accepted_by uuid references auth.users (id),
  check ((accepted_at is null) = (accepted_by is null)),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

create index run_guest_invites_workspace_id_run_id_idx on public.run_guest_invites (workspace_id, run_id);
create index run_guest_invites_invited_by_idx on public.run_guest_invites (invited_by);
create index run_guest_invites_accepted_by_idx on public.run_guest_invites (accepted_by);

alter table public.run_guest_invites enable row level security;

create table public.run_guests (
  workspace_id uuid not null,
  run_id uuid not null,
  user_id uuid not null references auth.users (id),
  invited_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  primary key (run_id, user_id),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

create index run_guests_workspace_id_run_id_idx on public.run_guests (workspace_id, run_id);
create index run_guests_user_id_idx on public.run_guests (user_id);
create index run_guests_invited_by_idx on public.run_guests (invited_by);

alter table public.run_guests enable row level security;

create function private.is_run_guest(target_run_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.run_guests g
    where g.run_id = target_run_id
      and g.user_id = (select auth.uid())
  );
$$;

create function private.is_guest_in_workspace(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.run_guests g
    where g.workspace_id = target_workspace_id
      and g.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_run_guest(uuid) from public;
revoke all on function private.is_guest_in_workspace(uuid) from public;
grant execute on function private.is_run_guest(uuid) to authenticated;
grant execute on function private.is_guest_in_workspace(uuid) to authenticated;

create policy runs_select_for_guests
  on public.runs for select to authenticated
  using ((select private.is_run_guest(id)));

create policy hook_events_select_for_guests
  on public.hook_events for select to authenticated
  using ((select private.is_run_guest(run_id)));

create policy run_comments_select_for_guests
  on public.run_comments for select to authenticated
  using (audience = 'client' and (select private.is_run_guest(run_id)));

-- Only the name: it tells the client which agency shared the run.
create policy workspaces_select_for_guests
  on public.workspaces for select to authenticated
  using ((select private.is_guest_in_workspace(id)));

create policy run_guests_select_for_members_and_self
  on public.run_guests for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_workspace_member(workspace_id)));

-- Returns the invite id, or null when the inviter is not a member of the run's workspace.
create function public.create_run_guest_invite(
  p_run_id uuid,
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
  run_workspace_id uuid := private.team_workspace_of_run(p_run_id, p_inviter_id);
  new_invite_id uuid;
begin
  if run_workspace_id is null then
    return null;
  end if;

  insert into public.run_guest_invites (workspace_id, run_id, email, token_hash, invited_by)
  values (run_workspace_id, p_run_id, lower(p_email), p_token_hash, p_inviter_id)
  returning id into new_invite_id;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values
    (run_workspace_id, p_run_id, p_inviter_id, 'guest_invited', '{}'),
    (run_workspace_id, p_run_id, p_inviter_id, 'invite_sent', '{"kind": "guest"}');

  return new_invite_id;
end;
$$;

-- Returns the run id, or null when the invite is unknown, expired, already used, or was sent to
-- a different email address.
create function public.accept_run_guest_invite(
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
  pending_invite public.run_guest_invites%rowtype;
begin
  select * into pending_invite
  from public.run_guest_invites
  where token_hash = p_token_hash
    and accepted_at is null
    and expires_at > now()
    and email = lower(p_user_email)
  for update;

  if not found then
    return null;
  end if;

  insert into public.run_guests (workspace_id, run_id, user_id, invited_by)
  values (pending_invite.workspace_id, pending_invite.run_id, p_user_id, pending_invite.invited_by)
  on conflict (run_id, user_id) do nothing;

  update public.run_guest_invites
  set accepted_at = now(), accepted_by = p_user_id
  where id = pending_invite.id;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (
    pending_invite.workspace_id, pending_invite.run_id, p_user_id, 'invite_accepted',
    '{"kind": "guest"}'
  );

  return pending_invite.run_id;
end;
$$;

-- Workspace membership wins over guest access when a person has both.
create or replace function public.record_run_view(p_run_id uuid, p_user_id uuid)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid;
  viewer_role text;
  newly_joined boolean;
begin
  select r.workspace_id, coalesce(m.role, case when g.user_id is not null then 'guest' end)
  into run_workspace_id, viewer_role
  from public.runs r
  left join public.workspace_members m on m.workspace_id = r.workspace_id and m.user_id = p_user_id
  left join public.run_guests g on g.run_id = r.id and g.user_id = p_user_id
  where r.id = p_run_id;

  if viewer_role is null then
    return null;
  end if;

  insert into public.run_participants (workspace_id, run_id, user_id, role)
  values (run_workspace_id, p_run_id, p_user_id, viewer_role)
  on conflict (run_id, user_id) do nothing
  returning true into newly_joined;

  if newly_joined then
    insert into public.events (workspace_id, run_id, actor_id, name, props)
    values (
      run_workspace_id, p_run_id, p_user_id, 'participant_joined',
      jsonb_build_object('role', viewer_role, 'view', 'timeline')
    );
  end if;

  return viewer_role;
end;
$$;

-- Members choose the audience; a guest's comment always goes to the client audience.
drop function public.post_run_comment(uuid, uuid, text, uuid);

create function public.post_run_comment(
  p_run_id uuid,
  p_author_id uuid,
  p_body text,
  p_hook_event_id uuid,
  p_audience text default 'team'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid;
  is_member boolean;
  comment_audience text;
  new_comment_id uuid;
begin
  select
    r.workspace_id,
    m.user_id is not null
  into run_workspace_id, is_member
  from public.runs r
  left join public.workspace_members m on m.workspace_id = r.workspace_id and m.user_id = p_author_id
  left join public.run_guests g on g.run_id = r.id and g.user_id = p_author_id
  where r.id = p_run_id
    and (m.user_id is not null or g.user_id is not null);

  if run_workspace_id is null then
    return null;
  end if;

  comment_audience := case when is_member then p_audience else 'client' end;

  insert into public.run_comments (workspace_id, run_id, hook_event_id, author_id, body, audience)
  values (run_workspace_id, p_run_id, p_hook_event_id, p_author_id, btrim(p_body), comment_audience)
  returning id into new_comment_id;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (
    run_workspace_id, p_run_id, p_author_id, 'comment_posted',
    jsonb_build_object('audience', comment_audience)
  );

  return new_comment_id;
end;
$$;

revoke execute on function public.create_run_guest_invite(uuid, uuid, text, text)
  from public, anon, authenticated;
revoke execute on function public.accept_run_guest_invite(text, uuid, text)
  from public, anon, authenticated;
revoke execute on function public.post_run_comment(uuid, uuid, text, uuid, text)
  from public, anon, authenticated;
grant execute on function public.create_run_guest_invite(uuid, uuid, text, text) to service_role;
grant execute on function public.accept_run_guest_invite(text, uuid, text) to service_role;
grant execute on function public.post_run_comment(uuid, uuid, text, uuid, text) to service_role;
