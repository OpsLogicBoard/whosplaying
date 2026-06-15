// Create a Stripe Checkout session for an org — subscription (Venue Pro /
// Founding / multi-venue) or a one-off $5 boost. Returns the hosted Checkout
// URL. Caller must be an owner/manager of the org (verified via their JWT).
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

const PRICE = {
  venue_pro: Deno.env.get('STRIPE_PRICE_VENUE_PRO_MONTHLY')!,
  founding: Deno.env.get('STRIPE_PRICE_VENUE_PRO_FOUNDING_MONTHLY')!,
  additional: Deno.env.get('STRIPE_PRICE_VENUE_ADDITIONAL_MONTHLY')!,
  boost: Deno.env.get('STRIPE_PRICE_BOOST_ONE_TIME')!,
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'content-type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Identify the caller from their JWT.
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return json({ error: 'unauthorized' }, 401)
  const { data: userData, error: userErr } = await admin.auth.getUser(token)
  if (userErr || !userData.user) return json({ error: 'unauthorized' }, 401)
  const userId = userData.user.id

  const body = await req.json().catch(() => ({}))
  const { orgId, kind, plan, extraVenues = 0, venueId, eventId, successUrl, cancelUrl } = body
  if (!orgId || !successUrl || !cancelUrl) return json({ error: 'missing_params' }, 400)

  // Authorize: caller must own or manage the org.
  const { data: membership } = await admin
    .from('organization_members')
    .select('role')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .in('role', ['owner', 'manager'])
    .maybeSingle()
  if (!membership) return json({ error: 'forbidden' }, 403)

  // Reuse the org's Stripe customer if it already has one.
  const { data: org } = await admin
    .from('organizations')
    .select('billing_email')
    .eq('id', orgId)
    .single()
  const { data: sub } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('organization_id', orgId)
    .not('stripe_customer_id', 'is', null)
    .maybeSingle()

  let customerId = sub?.stripe_customer_id as string | undefined
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: org?.billing_email ?? userData.user.email,
      metadata: { organization_id: orgId },
    })
    customerId = customer.id
  }

  try {
    if (kind === 'boost') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        line_items: [{ price: PRICE.boost, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { organization_id: orgId, venue_id: venueId ?? '', event_id: eventId ?? '' },
      })
      return json({ url: session.url })
    }

    // subscription: Venue Pro or Founding, plus optional additional venues
    const basePrice = plan === 'founding' ? PRICE.founding : PRICE.venue_pro
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      { price: basePrice, quantity: 1 },
    ]
    if (extraVenues > 0) lineItems.push({ price: PRICE.additional, quantity: extraVenues })

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: { metadata: { organization_id: orgId } },
      allow_promotion_codes: true,
    })
    return json({ url: session.url })
  } catch (err) {
    console.error('checkout error', (err as Error).message)
    return json({ error: 'checkout_failed' }, 500)
  }
})
