// Generates an OG/social-share image for an event (PNG). STUB.
// Production impl: Satori + resvg, render the EventCard with branded background.
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'og-image' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
