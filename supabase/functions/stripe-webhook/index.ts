// Stripe webhook → reconcile subscriptions + entitlements.
//
// The ONLY writer of billing-derived state (subscriptions/entitlements/
// feature_purchases are read-only to clients). Verifies the Stripe signature,
// then on subscription lifecycle events upserts the org's subscription row and
// calls recompute_entitlements(); on one-off boost payments records the purchase
// + usage event. Uses the service-role key (bypasses RLS).
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  httpClient: Stripe.createFetchHttpClient(),
})
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } },
)

const PRICE = {
  founding: Deno.env.get('STRIPE_PRICE_VENUE_PRO_FOUNDING_MONTHLY'),
  additional: Deno.env.get('STRIPE_PRICE_VENUE_ADDITIONAL_MONTHLY'),
  boost: Deno.env.get('STRIPE_PRICE_BOOST_ONE_TIME'),
}

const STATUS_MAP: Record<string, string> = {
  trialing: 'trialing',
  active: 'active',
  past_due: 'past_due',
  unpaid: 'past_due',
  canceled: 'canceled',
  incomplete: 'incomplete',
  incomplete_expired: 'canceled',
}

async function reconcileSubscription(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.organization_id
  if (!orgId) {
    console.warn('subscription without organization_id metadata', sub.id)
    return
  }
  const items = sub.items.data
  const priceIds = items.map((i) => i.price.id)
  const isFounding = priceIds.includes(PRICE.founding!)
  const additionalItem = items.find((i) => i.price.id === PRICE.additional)
  const extraVenues = additionalItem?.quantity ?? 0
  const planKey = extraVenues > 0 ? 'multi_venue' : 'venue_pro'

  // One active subscription row per org — update the existing row (created free
  // at org signup) or insert if missing.
  const { data: existing } = await admin
    .from('subscriptions')
    .select('id')
    .eq('organization_id', orgId)
    .neq('status', 'canceled')
    .maybeSingle()

  const row = {
    organization_id: orgId,
    plan_key: planKey,
    status: STATUS_MAP[sub.status] ?? 'active',
    venue_quantity: 1 + extraVenues,
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    await admin.from('subscriptions').update(row).eq('id', existing.id)
  } else {
    await admin.from('subscriptions').insert(row)
  }

  if (isFounding) {
    await admin.from('organizations').update({ is_founding: true }).eq('id', orgId)
  }
  await admin.rpc('recompute_entitlements', { _org: orgId })
}

async function cancelSubscription(sub: Stripe.Subscription) {
  const orgId = sub.metadata?.organization_id
  if (!orgId) return
  await admin
    .from('subscriptions')
    .update({ plan_key: 'free', status: 'canceled', updated_at: new Date().toISOString() })
    .eq('stripe_subscription_id', sub.id)
  await admin.rpc('recompute_entitlements', { _org: orgId })
}

async function recordBoost(session: Stripe.Checkout.Session) {
  const orgId = session.metadata?.organization_id
  const venueId = session.metadata?.venue_id ?? null
  if (!orgId) return
  await admin.from('feature_purchases').insert({
    organization_id: orgId,
    venue_id: venueId,
    kind: 'boost',
    amount_cents: session.amount_total ?? 500,
    status: 'paid',
    stripe_payment_intent_id:
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
  })
  await admin.from('usage_events').insert({
    organization_id: orgId,
    venue_id: venueId,
    kind: 'boost',
    metadata: { event_id: session.metadata?.event_id ?? null, source: 'checkout' },
  })
}

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature')
  if (!sig) return new Response('missing signature', { status: 400 })

  let event: Stripe.Event
  try {
    const body = await req.text()
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret)
  } catch (err) {
    console.error('signature verification failed', (err as Error).message)
    return new Response('invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'payment') await recordBoost(session)
        // subscription-mode checkouts reconcile via customer.subscription.* below
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await reconcileSubscription(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await cancelSubscription(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }
  } catch (err) {
    console.error('handler error', event.type, (err as Error).message)
    return new Response('handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'content-type': 'application/json' },
  })
})
