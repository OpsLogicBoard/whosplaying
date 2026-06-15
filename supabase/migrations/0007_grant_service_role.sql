-- Restore standard service_role access.
-- This project was created with "Automatically expose new tables" disabled, and
-- migration 0004 only granted anon/authenticated + set default privileges for
-- those two roles — service_role was never granted. The server-side edge
-- functions (stripe-webhook etc.) use the service_role key to reconcile
-- billing-derived state, so without these grants those writes fail with
-- "permission denied". service_role is never exposed to clients.

grant usage on schema public to service_role;

grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all routines in schema public to service_role;

-- Future tables/sequences/routines auto-grant to service_role too.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on routines to service_role;
