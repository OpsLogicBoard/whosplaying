-- Layer 3 of the credentials architecture (docs/SECURE_CREDENTIALS_ARCHITECTURE.md):
-- runtime secrets that edge functions read dynamically out of the encrypted
-- Supabase Vault, so they can be rotated without redeploying a function.
--
-- Access pattern (edge function, service_role client only):
--   const { data } = await supabaseAdmin.rpc('get_vault_secret', { secret_name: 'STRIPE_WEBHOOK_SECRET' })
--
-- Security:
--   * SECURITY DEFINER so it can read vault.decrypted_secrets, which is otherwise
--     unreadable by API roles.
--   * `set search_path = ''` + fully-qualified names — required by the Supabase
--     security advisor (see 0003); a malicious schema cannot shadow `vault`/`public`.
--   * EXECUTE granted to service_role ONLY. anon/authenticated cannot call it, so
--     a leaked anon key can never pull a vault secret.

create extension if not exists supabase_vault with schema vault;

create or replace function public.get_vault_secret(secret_name text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  result text;
begin
  select decrypted_secret into result
  from vault.decrypted_secrets
  where name = secret_name
  limit 1;
  return result;
end;
$$;

-- Lock down who can call it: service_role only.
revoke all on function public.get_vault_secret(text) from public, anon, authenticated;
grant execute on function public.get_vault_secret(text) to service_role;
