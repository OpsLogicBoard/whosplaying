// Magic-link request — STUB. Wire to supabase.auth.signInWithOtp.
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'send-magic-link' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
