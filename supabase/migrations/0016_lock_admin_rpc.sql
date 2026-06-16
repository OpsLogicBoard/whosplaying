-- 0016_lock_admin_rpc.sql
-- Follow-up to 0015. The admin_* EXECUTE revoke in 0015 was incomplete: EXECUTE is also
-- granted to PUBLIC, which `anon` inherits, so revoking from `anon` alone left them
-- anon-callable. Revoke from PUBLIC, then re-grant to `authenticated` so the admin console
-- (signed-in platform admins) keeps working. These functions already self-gate on
-- public.is_platform_admin(), so authenticated access is safe; this removes the anon surface.
--
-- Verified via get_advisors after apply: admin_log / admin_platform_kpis /
-- admin_market_density / admin_role_of no longer appear under anon_security_definer.

revoke execute on function public.admin_log(text, text, uuid, jsonb) from public;
revoke execute on function public.admin_platform_kpis()              from public;
revoke execute on function public.admin_market_density()             from public;
revoke execute on function public.admin_role_of()                    from public;

grant execute on function public.admin_log(text, text, uuid, jsonb) to authenticated;
grant execute on function public.admin_platform_kpis()              to authenticated;
grant execute on function public.admin_market_density()             to authenticated;
grant execute on function public.admin_role_of()                    to authenticated;
