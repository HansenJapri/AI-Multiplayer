-- Hosted Supabase projects with automatic RLS enabled get public.rls_auto_enable(), a SECURITY
-- DEFINER event-trigger function that PUBLIC may execute. Event-trigger functions cannot be called
-- through RPC, and the event trigger keeps firing without EXECUTE, so revoking it only removes a
-- needless grant (and the security advisor warning). Local databases do not have the function.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end;
$$;
