// Create a Stripe Customer Portal session so a venue can self-serve billing
// (update card, view invoices, cancel). Caller must own/manage the org.
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})
const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return json({ error: 'unauthorized' }, 401)
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401)

  const { orgId, returnUrl } = await req.json().catch(() => ({}))
  if (!orgId || !returnUrl) return json({ error: 'missing_params' }, 400)

  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', userData.user.id)
    .in('role', ['owner', 'manager'])
    .maybeSingle()
  if (!membership) return json({ error: 'forbidden' }, 403)

  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', orgId)
    .not('stripe_customer_id', 'is', null)
    .maybeSingle()
  if (!sub?.stripe_customer_id) return json({ error: 'no_customer' }, 404)

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id as string,
      return_url: returnUrl,
    })
    return json({ url: session.url })
  } catch (err) {
    console.error('portal error', (err as Error).message)
    return json({ error: 'portal_failed' }, 500)
  }
})
