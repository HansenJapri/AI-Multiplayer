-- One profile per account, in the public schema. Every table that refers to a person now points
-- here instead of into auth.users, so the schema reads as one connected graph and server code can
-- read emails with one query instead of the auth admin API.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  -- Null only for accounts without an email (none today: sign-up is by email and password).
  email text unique check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Written only by the trigger below; clients may read their own row.
revoke insert, update, delete on public.profiles from anon, authenticated;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create function private.sync_profile_from_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, lower(new.email))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function private.sync_profile_from_account() from public;

create trigger sync_profile_after_account_change
  after insert or update of email on auth.users
  for each row execute function private.sync_profile_from_account();

insert into public.profiles (id, email, created_at)
select id, lower(email), created_at from auth.users
on conflict (id) do nothing;

-- Repoint every person reference from auth.users to profiles.
do $$
declare
  reference record;
begin
  for reference in
    select con.conrelid::regclass as table_name, con.conname as constraint_name
    from pg_constraint con
    where con.contype = 'f'
      and con.confrelid = 'auth.users'::regclass
      and con.connamespace in ('public'::regnamespace, 'private'::regnamespace)
      and con.conrelid <> 'public.profiles'::regclass
  loop
    execute format('alter table %s drop constraint %I', reference.table_name, reference.constraint_name);
  end loop;
end;
$$;

alter table public.workspace_members
  add constraint workspace_members_user_id_fkey foreign key (user_id) references public.profiles (id);
alter table public.workspace_invites
  add constraint workspace_invites_invited_by_fkey foreign key (invited_by) references public.profiles (id),
  add constraint workspace_invites_accepted_by_fkey foreign key (accepted_by) references public.profiles (id);
alter table public.cli_installs
  add constraint cli_installs_user_id_fkey foreign key (user_id) references public.profiles (id);
alter table private.cli_device_logins
  add constraint cli_device_logins_approved_by_fkey foreign key (approved_by) references public.profiles (id);
alter table public.run_participants
  add constraint run_participants_user_id_fkey foreign key (user_id) references public.profiles (id);
alter table public.run_comments
  add constraint run_comments_author_id_fkey foreign key (author_id) references public.profiles (id);
alter table public.steer_messages
  add constraint steer_messages_author_id_fkey foreign key (author_id) references public.profiles (id);
alter table public.run_holds
  add constraint run_holds_raised_by_fkey foreign key (raised_by) references public.profiles (id),
  add constraint run_holds_released_by_fkey foreign key (released_by) references public.profiles (id);
alter table public.run_guest_invites
  add constraint run_guest_invites_invited_by_fkey foreign key (invited_by) references public.profiles (id),
  add constraint run_guest_invites_accepted_by_fkey foreign key (accepted_by) references public.profiles (id);
alter table public.run_guests
  add constraint run_guests_user_id_fkey foreign key (user_id) references public.profiles (id),
  add constraint run_guests_invited_by_fkey foreign key (invited_by) references public.profiles (id);
alter table public.deposits
  add constraint deposits_started_by_fkey foreign key (started_by) references public.profiles (id);
-- Events had no actor reference at all.
alter table public.events
  add constraint events_actor_id_fkey foreign key (actor_id) references public.profiles (id);

create index events_actor_id_idx on public.events (actor_id);

-- Emails for hook directives now come from profiles.
create or replace function private.account_email(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email from public.profiles where id = p_user_id;
$$;
