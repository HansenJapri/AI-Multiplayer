-- Supabase grants ALL on public tables to anon and authenticated. Row level security governs
-- SELECT/INSERT/UPDATE/DELETE but never TRUNCATE, and clients need neither REFERENCES nor TRIGGER,
-- so those three are removed from existing tables and from every table created later.
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from anon, authenticated;
