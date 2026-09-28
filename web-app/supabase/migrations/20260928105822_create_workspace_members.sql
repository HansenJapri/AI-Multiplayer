-- Team membership. Owners and drivers only; client guests get run-scoped access elsewhere.
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces (id),
  user_id uuid not null references auth.users (id),
  role text not null check (role in ('owner', 'driver')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);

alter table public.workspace_members enable row level security;

-- Policy helpers live in a schema the Data API does not expose, so clients cannot call them
-- as RPC. SECURITY DEFINER lets policies on workspace_members read it without recursing.
create schema private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create function private.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members m
    where m.workspace_id = target_workspace_id
      and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_workspace_member(uuid) from public;
grant execute on function private.is_workspace_member(uuid) to authenticated;

-- Members read their own workspaces and member lists. Every write goes through the server.
create policy workspaces_select_for_members
  on public.workspaces for select to authenticated
  using ((select private.is_workspace_member(id)));

create policy workspace_members_select_for_members
  on public.workspace_members for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

-- Creates a workspace and makes the caller its owner in one transaction.
create function public.create_workspace_with_owner(p_name text, p_owner_id uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.workspaces (name) values (p_name) returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, p_owner_id, 'owner');
  return new_workspace_id;
end;
$$;

revoke execute on function public.create_workspace_with_owner(text, uuid)
  from public, anon, authenticated;
grant execute on function public.create_workspace_with_owner(text, uuid) to service_role;
