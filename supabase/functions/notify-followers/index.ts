// On a new confirmed event, fan out push + email notifications to every
// user following the venue or any named performer. STUB.
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'notify-followers' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
