// Per-artist / per-venue ICS feed — STUB.
// Path: /functions/v1/ics-export?type=venue&id=<uuid>
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'ics-export' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
