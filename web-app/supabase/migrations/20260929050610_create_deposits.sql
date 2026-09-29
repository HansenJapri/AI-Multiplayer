-- Refundable deposits that reserve a paid plan. The payment provider is not chosen yet, so the
-- provider is just a name: the app hands checkout to a provider adapter and records the result
-- here. With the manual adapter an operator marks a deposit paid after the money arrives.
create table public.deposits (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id),
  plan text not null check (plan in ('team', 'agency')),
  seats integer not null check (seats between 1 and 500),
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  provider text not null check (provider ~ '^[a-z][a-z0-9_]{0,39}$'),
  provider_reference text check (char_length(provider_reference) between 1 and 200),
  status text not null default 'pending' check (status in ('pending', 'paid')),
  started_by uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  check ((status = 'paid') = (paid_at is not null))
);

create index deposits_workspace_id_created_at_idx on public.deposits (workspace_id, created_at);
create index deposits_started_by_idx on public.deposits (started_by);

alter table public.deposits enable row level security;

create policy deposits_select_for_members
  on public.deposits for select to authenticated
  using ((select private.is_workspace_member(workspace_id)));

-- Returns the deposit id, or null when the user is not an owner of the workspace. The amount is
-- computed by the server from its price list; this function only records it.
create function public.start_deposit(
  p_workspace_id uuid,
  p_user_id uuid,
  p_plan text,
  p_seats integer,
  p_amount_cents integer,
  p_currency text,
  p_provider text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_deposit_id uuid;
begin
  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_user_id and role = 'owner'
  ) then
    return null;
  end if;

  insert into public.deposits (
    workspace_id, plan, seats, amount_cents, currency, provider, started_by
  )
  values (p_workspace_id, p_plan, p_seats, p_amount_cents, p_currency, p_provider, p_user_id)
  returning id into new_deposit_id;

  insert into public.events (workspace_id, actor_id, name, props)
  values (
    p_workspace_id, p_user_id, 'deposit_started',
    jsonb_build_object(
      'plan', p_plan, 'seats', p_seats, 'amount_cents', p_amount_cents,
      'currency', p_currency, 'provider', p_provider
    )
  );

  return new_deposit_id;
end;
$$;

-- Marks a pending deposit paid. Returns false when it is unknown or already paid, so a provider
-- callback that arrives twice records one deposit_completed.
create function public.complete_deposit(p_deposit_id uuid, p_provider_reference text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  paid_deposit public.deposits%rowtype;
begin
  update public.deposits
  set status = 'paid', paid_at = now(), provider_reference = p_provider_reference
  where id = p_deposit_id and status = 'pending'
  returning * into paid_deposit;

  if not found then
    return false;
  end if;

  insert into public.events (workspace_id, actor_id, name, props)
  values (
    paid_deposit.workspace_id, paid_deposit.started_by, 'deposit_completed',
    jsonb_build_object(
      'plan', paid_deposit.plan, 'seats', paid_deposit.seats,
      'amount_cents', paid_deposit.amount_cents, 'currency', paid_deposit.currency,
      'provider', paid_deposit.provider
    )
  );

  return true;
end;
$$;

revoke execute on function public.start_deposit(uuid, uuid, text, integer, integer, text, text)
  from public, anon, authenticated;
revoke execute on function public.complete_deposit(uuid, text) from public, anon, authenticated;
grant execute on function public.start_deposit(uuid, uuid, text, integer, integer, text, text)
  to service_role;
grant execute on function public.complete_deposit(uuid, text) to service_role;
