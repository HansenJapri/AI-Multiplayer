-- Members of a workspace can read its runs and their timelines. Writes stay server-only.
create policy runs_select_for_members
  on public.runs for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

create policy hook_events_select_for_members
  on public.hook_events for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

-- Target of the composite foreign key that anchors comments to a step in the same workspace.
alter table public.hook_events add constraint hook_events_workspace_id_id_key unique (workspace_id, id);

-- Everyone who has opened a run, with the role they had then. Drives participant_joined and
-- the "two or more people on the same run" decision metric.
create table public.run_participants (
  workspace_id uuid not null,
  run_id uuid not null,
  user_id uuid not null references auth.users (id),
  role text not null check (role in ('owner', 'driver', 'guest')),
  first_seen_at timestamptz not null default now(),
  primary key (run_id, user_id),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id)
);

create index run_participants_workspace_id_run_id_idx on public.run_participants (workspace_id, run_id);
create index run_participants_user_id_idx on public.run_participants (user_id);

alter table public.run_participants enable row level security;

create policy run_participants_select_for_members
  on public.run_participants for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

-- Comments on a run, optionally anchored to one timeline step.
create table public.run_comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  run_id uuid not null,
  hook_event_id uuid,
  author_id uuid not null references auth.users (id),
  body text not null check (char_length(btrim(body)) between 1 and 4000),
  created_at timestamptz not null default now(),
  foreign key (workspace_id, run_id) references public.runs (workspace_id, id),
  foreign key (workspace_id, hook_event_id) references public.hook_events (workspace_id, id)
);

create index run_comments_workspace_id_run_id_created_at_idx
  on public.run_comments (workspace_id, run_id, created_at);
create index run_comments_workspace_id_hook_event_id_idx
  on public.run_comments (workspace_id, hook_event_id);
create index run_comments_author_id_idx on public.run_comments (author_id);

alter table public.run_comments enable row level security;

create policy run_comments_select_for_members
  on public.run_comments for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

-- Returns the viewer's role on the run, or null when they may not see it. The first view by a
-- person records participant_joined.
create function public.record_run_view(p_run_id uuid, p_user_id uuid)
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
  select r.workspace_id, m.role into run_workspace_id, viewer_role
  from public.runs r
  join public.workspace_members m on m.workspace_id = r.workspace_id and m.user_id = p_user_id
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

-- Returns the new comment id, or null when the author may not comment on the run.
create function public.post_run_comment(
  p_run_id uuid,
  p_author_id uuid,
  p_body text,
  p_hook_event_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  run_workspace_id uuid;
  new_comment_id uuid;
begin
  select r.workspace_id into run_workspace_id
  from public.runs r
  join public.workspace_members m on m.workspace_id = r.workspace_id and m.user_id = p_author_id
  where r.id = p_run_id;

  if run_workspace_id is null then
    return null;
  end if;

  insert into public.run_comments (workspace_id, run_id, hook_event_id, author_id, body)
  values (run_workspace_id, p_run_id, p_hook_event_id, p_author_id, btrim(p_body))
  returning id into new_comment_id;

  insert into public.events (workspace_id, run_id, actor_id, name, props)
  values (run_workspace_id, p_run_id, p_author_id, 'comment_posted', '{"audience": "team"}');

  return new_comment_id;
end;
$$;

revoke execute on function public.record_run_view(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.post_run_comment(uuid, uuid, text, uuid)
  from public, anon, authenticated;
grant execute on function public.record_run_view(uuid, uuid) to service_role;
grant execute on function public.post_run_comment(uuid, uuid, text, uuid) to service_role;

-- Live timeline and comments. Realtime applies the select policies above per subscriber.
alter publication supabase_realtime add table public.hook_events, public.run_comments;
