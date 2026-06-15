-- Materialize entitlements when a venue is created.
-- The BEFORE INSERT auto-org trigger (0005) creates the org + free subscription
-- but can't build entitlements, because recompute_entitlements() loops over the
-- org's venues and the new venue row doesn't exist yet at BEFORE INSERT time.
-- Result: free venues had 0 entitlement rows, so even the free "1 active offer"
-- gate (has_entitlement / entitlement_limit) returned 0. This AFTER INSERT
-- trigger rebuilds entitlements once the venue exists (also covers venues added
-- to an existing org later).

create or replace function public.venue_after_insert_entitlements()
returns trigger language plpgsql
security definer
set search_path = public
as $$
begin
  if new.organization_id is not null then
    perform public.recompute_entitlements(new.organization_id);
  end if;
  return new;
end;
$$;

drop trigger if exists on_venue_recompute_entitlements on public.venues;
create trigger on_venue_recompute_entitlements
  after insert on public.venues
  for each row execute procedure public.venue_after_insert_entitlements();
