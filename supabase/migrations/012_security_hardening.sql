-- BestHomz security hardening.
-- Pin search_path for every application-defined function flagged by the Supabase advisor.
alter function public.set_updated_at() set search_path = '';
alter function public.set_quote_number() set search_path = '';
alter function public.set_order_number() set search_path = '';
alter function public.staff_roles() set search_path = '';
alter function public.handle_new_user() set search_path = '';
alter function public.is_staff() set search_path = '';
alter function public.is_admin() set search_path = '';
alter function public.log_quote_status_change() set search_path = '';
alter function public.log_order_status_change() set search_path = '';
alter function public.prevent_profile_privilege_escalation() set search_path = '';

-- Trigger-only SECURITY DEFINER functions must not be callable through the Data API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.log_quote_status_change() from public, anon, authenticated;
revoke execute on function public.log_order_status_change() from public, anon, authenticated;
revoke execute on function public.prevent_profile_privilege_escalation() from public, anon, authenticated;
revoke execute on function public.staff_roles() from public, anon, authenticated;

-- RLS policies invoke these role-check helpers for signed-in users.
revoke execute on function public.is_staff() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;
