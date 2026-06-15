// Pulls a venue's external business calendar (Google/Apple ICS) and yields
// importable event candidates. STUB.
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'ics-import' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
