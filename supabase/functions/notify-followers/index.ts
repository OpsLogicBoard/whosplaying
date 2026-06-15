// On a new confirmed event, fan out push + email notifications to every
// user following the venue or any named performer. STUB.
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'notify-followers' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
