// On a CONFIRMED event, email every follower of the venue or any named performer,
// from notifications@whosplaying.live via Resend.
//
// Server-only: the caller must present the service_role key (this is meant to be
// invoked by a trusted server context when an event flips to `confirmed`, not by
// end users). POST { event_id }.
import { createClient } from 'npm:@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const FROM = "Who's Playing <notifications@whosplaying.live>"
const SITE = 'https://whosplaying.live'

const ESC: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c])

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  // Server-only: require the service_role key.
  const bearer = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!bearer || bearer !== SERVICE_KEY) return json({ error: 'forbidden' }, 403)

  const { event_id } = await req.json().catch(() => ({}))
  if (!event_id) return json({ error: 'event_id required' }, 400)

  // Event must exist and be confirmed (cross-confirmation invariant).
  const { data: ev, error: evErr } = await admin
    .from('events')
    .select('id, title, starts_at, status, ticket_url, venues(name)')
    .eq('id', event_id)
    .single()
  if (evErr || !ev) return json({ error: 'event_not_found' }, 404)
  if (ev.status !== 'confirmed') return json({ skipped: 'not_confirmed', status: ev.status })

  // Recipients: followers of the venue or any performer, with emails.
  const { data: recips, error: rErr } = await admin.rpc('event_follower_emails', {
    _event_id: event_id,
  })
  if (rErr) return json({ error: 'recipients_failed', detail: rErr.message }, 500)
  if (!recips || recips.length === 0) return json({ event_id: ev.id, sent: 0, note: 'no_followers' })

  const venueName = (ev as { venues?: { name?: string } }).venues?.name ?? 'a venue'
  const when = new Date(ev.starts_at).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  })
  const subject = `${ev.title} at ${venueName}`
  const eventUrl = `${SITE}/event/${ev.id}`

  const messages = (recips as Array<{ email: string; display_name: string | null }>).map((r) => ({
    from: FROM,
    to: [r.email],
    subject,
    html:
      `<div style="font-family:system-ui,-apple-system,Arial,sans-serif;max-width:520px;color:#1F2933">` +
      `<p>Hi ${esc(r.display_name ?? 'there')},</p>` +
      `<p><strong>${esc(ev.title)}</strong> is confirmed at <strong>${esc(venueName)}</strong> on ${esc(when)}.</p>` +
      (ev.ticket_url ? `<p><a href="${esc(ev.ticket_url)}" style="color:#FF5A5F">Get tickets</a></p>` : '') +
      `<p><a href="${eventUrl}" style="color:#FF5A5F">View on Who's Playing</a></p>` +
      `<hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>` +
      `<p style="color:#888;font-size:12px">You're getting this because you follow ${esc(venueName)} ` +
      `or a performer on this lineup. Manage who you follow at <a href="${SITE}">whosplaying.live</a>.</p>` +
      `</div>`,
  }))

  // Resend batch send (max 100 messages per call), one distinct email per follower.
  let sent = 0
  let failed = 0
  for (let i = 0; i < messages.length; i += 100) {
    const batch = messages.slice(i, i + 100)
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(batch),
    })
    if (res.ok) {
      sent += batch.length
    } else {
      failed += batch.length
      console.error('resend batch failed', res.status, await res.text())
    }
  }

  return json({ event_id: ev.id, recipients: recips.length, sent, failed })
})
