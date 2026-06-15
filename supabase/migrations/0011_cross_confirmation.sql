-- Enforce the cross-confirmation invariant at the DB layer.
-- An event is 'confirmed' ONLY when it's published AND every named performer has
-- confirmed; otherwise a published event sits in 'proposed' — the "Lineup
-- confirming" grace state (so venue-posted events still appear in the feed while
-- performers confirm). draft/cancelled are never auto-changed. This can't be
-- bypassed by any client (it's trigger-enforced, not just RLS).

create or replace function public.all_performers_confirmed(_event uuid)
returns boolean language sql stable
set search_path = public
as $$
  -- vacuously true when there are no named performers (venue-only event)
  select not exists (
    select 1 from public.event_performers
    where event_id = _event and status <> 'confirmed'
  );
$$;

-- On any event write, normalize a published status to the consensus value.
-- BEFORE trigger sets NEW directly — no extra write, no recursion.
create or replace function public.events_enforce_confirmation()
returns trigger language plpgsql
set search_path = public
as $$
begin
  if new.status in ('proposed', 'confirmed') then
    new.status := case
      when public.all_performers_confirmed(new.id) then 'confirmed'::public.event_status
      else 'proposed'::public.event_status
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists events_enforce_confirmation on public.events;
create trigger events_enforce_confirmation
  before insert or update on public.events
  for each row execute procedure public.events_enforce_confirmation();

-- When a performer is added / confirms / declines / is removed, re-sync the
-- parent event. SECURITY DEFINER: a performer (artist) confirming their own row
-- has no UPDATE right on events under RLS, so the sync must bypass it.
create or replace function public.performers_sync_event()
returns trigger language plpgsql
security definer
set search_path = public
as $$
declare _eid uuid;
begin
  _eid := coalesce(new.event_id, old.event_id);
  update public.events set status = case
      when public.all_performers_confirmed(_eid) then 'confirmed'::public.event_status
      else 'proposed'::public.event_status
    end
    where id = _eid and status in ('proposed', 'confirmed');
  return coalesce(new, old);
end;
$$;

drop trigger if exists performers_sync_event on public.event_performers;
create trigger performers_sync_event
  after insert or update or delete on public.event_performers
  for each row execute procedure public.performers_sync_event();
