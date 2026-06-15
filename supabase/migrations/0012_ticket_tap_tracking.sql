-- Ticket link-out tap tracking (always-free; powers the views→taps funnel).
-- A goer tapping "Get Tickets" is not an org member, so a direct usage_events
-- insert would fail RLS. This SECURITY DEFINER function records the tap on the
-- event's behalf (no sensitive data — just an attributed tap), callable by
-- anon + authenticated. Pairs with UTM tags on the outbound link so the venue
-- also sees WhosPlaying as a traffic source in their own ticketing dashboard.

create or replace function public.log_ticket_tap(_event_id uuid)
returns void language plpgsql
security definer
set search_path = public
as $$
declare _venue uuid; _org uuid;
begin
  select e.venue_id, v.organization_id into _venue, _org
    from public.events e
    join public.venues v on v.id = e.venue_id
    where e.id = _event_id;
  if _venue is null then return; end if;
  insert into public.usage_events (organization_id, venue_id, kind, actor_user_id, metadata)
    values (_org, _venue, 'ticket_tap', auth.uid(), jsonb_build_object('event_id', _event_id));
end;
$$;

grant execute on function public.log_ticket_tap(uuid) to anon, authenticated;
