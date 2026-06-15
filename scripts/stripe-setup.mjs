#!/usr/bin/env node
// WhosPlaying — Stripe catalog setup (idempotent, TEST-mode only).
//
// Creates the products/prices the entitlement system + Phase B webhook expect,
// plus a Customer Portal config, then prints the price IDs to drop into env.
// Uses the bare Stripe REST API over fetch — no SDK install needed.
//
// Run:
//   STRIPE_SECRET_KEY=sk_test_xxx node scripts/stripe-setup.mjs
//
// Pricing (docs/MONETIZATION_AND_BUILD_PLAN.md): Venue Pro $24.99/mo, Founding
// $14.99/mo (locked for life), multi-venue +$12/mo each, one-off Boost $5.
// Ticket link-out is free; goers/artists never billed.

const KEY = process.env.STRIPE_SECRET_KEY
if (!KEY) {
  console.error('✖ Set STRIPE_SECRET_KEY (a TEST key, sk_test_…) and re-run.')
  process.exit(1)
}
if (KEY.startsWith('sk_live_') || KEY.startsWith('rk_live_')) {
  console.error('✖ Refusing to run with a LIVE key. Use your test key (sk_test_…). Build/iterate in test first.')
  process.exit(1)
}
if (!KEY.startsWith('sk_test_') && !KEY.startsWith('rk_test_')) {
  console.error('✖ That does not look like a Stripe test secret key (sk_test_… / rk_test_…).')
  process.exit(1)
}

const API = 'https://api.stripe.com/v1'

async function stripe(method, path, params) {
  const opts = { method, headers: { Authorization: `Bearer ${KEY}` } }
  if (params) {
    opts.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    opts.body = encode(params)
  }
  const res = await fetch(`${API}${path}`, opts)
  const json = await res.json()
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${json.error?.message ?? JSON.stringify(json)}`)
  }
  return json
}

// Form-encode with Stripe's bracket notation for nested objects.
function encode(obj, prefix) {
  const parts = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const key = prefix ? `${prefix}[${k}]` : k
    if (typeof v === 'object') parts.push(encode(v, key))
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`)
  }
  return parts.join('&')
}

// Find-or-create a product by a stable metadata key (idempotent re-runs).
async function ensureProduct(wpKey, name) {
  const found = await stripe('GET', `/products/search?query=${encodeURIComponent(`metadata['wp_key']:'${wpKey}'`)}&limit=1`)
  if (found.data?.length) return found.data[0]
  return stripe('POST', '/products', { name, metadata: { wp_key: wpKey } })
}

// Find-or-create a recurring/one-time price by lookup_key (idempotent).
async function ensurePrice({ lookup_key, product, unit_amount, recurring }) {
  const found = await stripe('GET', `/prices?lookup_keys[]=${encodeURIComponent(lookup_key)}&active=true&limit=1`)
  if (found.data?.length) return found.data[0]
  return stripe('POST', '/prices', {
    product,
    currency: 'usd',
    unit_amount,
    lookup_key,
    ...(recurring ? { recurring: { interval: 'month' } } : {}),
  })
}

async function main() {
  const acct = await stripe('GET', '/balance', null)
  if (acct.livemode) {
    console.error('✖ This key is in LIVE mode. Use a test key.')
    process.exit(1)
  }
  console.log('✓ Test mode confirmed (livemode: false)\n')

  const proProduct = await ensureProduct('venue_pro', 'Venue Pro')
  const boostProduct = await ensureProduct('event_boost', 'Event Boost')

  const prices = {
    VENUE_PRO_MONTHLY: await ensurePrice({ lookup_key: 'wp_venue_pro_monthly', product: proProduct.id, unit_amount: 2499, recurring: true }),
    VENUE_PRO_FOUNDING_MONTHLY: await ensurePrice({ lookup_key: 'wp_venue_pro_founding_monthly', product: proProduct.id, unit_amount: 1499, recurring: true }),
    VENUE_ADDITIONAL_MONTHLY: await ensurePrice({ lookup_key: 'wp_venue_additional_monthly', product: proProduct.id, unit_amount: 1200, recurring: true }),
    BOOST_ONE_TIME: await ensurePrice({ lookup_key: 'wp_boost_one_time', product: boostProduct.id, unit_amount: 500, recurring: false }),
  }

  // Customer Portal: let venues update payment method, cancel, and see invoices.
  await stripe('POST', '/billing_portal/configurations', {
    'business_profile[headline]': "Who's Playing — manage your Venue Pro plan",
    'features[invoice_history][enabled]': 'true',
    'features[payment_method_update][enabled]': 'true',
    'features[customer_update][enabled]': 'true',
    'features[customer_update][allowed_updates][]': 'email',
    'features[subscription_cancel][enabled]': 'true',
  }).catch((e) => console.warn('• Portal config note:', e.message))

  console.log('\n✓ Catalog ready. Add these to your env (e.g. apps/web/.env.local + the edge function):\n')
  for (const [env, price] of Object.entries(prices)) {
    console.log(`STRIPE_PRICE_${env}=${price.id}`)
  }
  console.log('\nPaste those STRIPE_PRICE_* lines back to me (the IDs are safe to share — they are not secrets).')
}

main().catch((e) => {
  console.error('\n✖', e.message)
  process.exit(1)
})
