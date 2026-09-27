-- Tenant-isolation invariants from AGENTS.md section 5, checked across every table in public so a
-- future table that forgets them fails here even if nobody writes a dedicated test for it.
begin;
create extension if not exists pgtap with schema extensions;

select plan(3);

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

-- Deny-by-default until workspace membership exists; the first member policy must update this.
select is_empty(
  $$ select tablename, policyname from pg_policies where schemaname = 'public' $$,
  'no row level security policy grants access yet'
);

select * from finish();
rollback;
