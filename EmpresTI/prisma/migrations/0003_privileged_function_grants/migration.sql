REVOKE ALL ON FUNCTION public.current_tenant_ids() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_tenant_ids() TO authenticated;
REVOKE ALL ON FUNCTION public.handle_new_auth_user() FROM PUBLIC, anon, authenticated;
