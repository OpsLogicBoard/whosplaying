-- Recipients for the notify-followers edge function: every user who follows the
-- event's venue OR any of its named performers, with their email.
--
-- SECURITY DEFINER because it reads auth.users (emails), which API roles cannot.
-- search_path='' + fully-qualified names (Supabase advisor, see 0003). Returns
-- rows ONLY for a confirmed event. service_role-only execute — the edge function
-- calls it with the service key; anon/authenticated cannot enumerate emails.

create or replace function public.event_follower_emails(_event_id uuid)
returns table (user_id uuid, email text, display_name text)
language sql
stable
security definer
set search_path = ''
as $$
  with ev as (
    select id, venue_id
    from public.events
    where id = _event_id and status = 'confirmed'
  ),
  followers as (
    -- followers of the venue
    select f.follower_user_id
    from public.follows f
    join ev on f.target_type = 'venue' and f.target_id = ev.venue_id
    union
    -- followers of any named performer (artist/band) on the lineup
    select f.follower_user_id
    from public.follows f
    join public.event_performers ep
      on ep.event_id = (select id from ev)
     and f.target_type::text = ep.performer_type::text
     and f.target_id = ep.performer_id
  )
  select distinct p.id, u.email, p.display_name
  from followers fl
  join public.profiles p on p.id = fl.follower_user_id
  join auth.users u on u.id = p.id
  where u.email is not null;
$$;

revoke all on function public.event_follower_emails(uuid) from public, anon, authenticated;
grant execute on function public.event_follower_emails(uuid) to service_role;
