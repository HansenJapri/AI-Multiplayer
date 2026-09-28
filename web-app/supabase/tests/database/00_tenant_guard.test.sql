-- Tenant-isolation invariants from AGENTS.md section 5, checked across every table in public so a
-- future table that forgets them fails here even if nobody writes a dedicated test for it.
begin;
create extension if not exists pgtap with schema extensions;

select plan(5);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  $$,
  'every public table has row level security enabled'
);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and c.relname <> 'workspaces'
      and not exists (
        select 1
        from pg_attribute a
        where a.attrelid = c.oid
          and a.attname = 'workspace_id'
          and a.attnotnull
          and not a.attisdropped
      )
  $$,
  'every public table except workspaces carries a non-null workspace_id'
);

-- RLS never applies to TRUNCATE, and client roles have no use for REFERENCES or TRIGGER, so
-- holding any of them would bypass tenant isolation.
select is_empty(
  $$
    select c.relname, client_role.name, privilege.name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    cross join (values ('anon'), ('authenticated')) as client_role(name)
    cross join (values ('TRUNCATE'), ('REFERENCES'), ('TRIGGER')) as privilege(name)
    where n.nspname = 'public'
      and c.relkind = 'r'
      and has_table_privilege(client_role.name, c.oid, privilege.name)
  $$,
  'anon and authenticated hold no privilege that row level security cannot restrict'
);

-- Functions in public are callable through the Data API as RPC. Only trigger functions (which
-- cannot be called directly) may stay executable by client roles.
select is_empty(
  $$
    select p.proname, client_role.name
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    cross join (values ('anon'), ('authenticated')) as client_role(name)
    where n.nspname = 'public'
      and p.prorettype <> 'trigger'::regtype
      and has_function_privilege(client_role.name, p.oid, 'EXECUTE')
  $$,
  'anon and authenticated cannot execute any public function'
);

-- Policies are for signed-in users only. A policy without an explicit role applies to PUBLIC,
-- which includes anon, so every policy must name authenticated.
select is_empty(
  $$
    select tablename, policyname, roles
    from pg_policies
    where schemaname = 'public' and not (roles <@ array['authenticated']::name[])
  $$,
  'every row level security policy applies to authenticated only'
);

select * from finish();
rollback;
