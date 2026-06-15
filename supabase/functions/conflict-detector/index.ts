// Nightly job — scans events for overlapping starts_at/ends_at on the same
// venue OR the same performer (artist/band) and writes rows into
// conflict_flags. Notifies both sides via notify-followers. STUB.
import { getCorsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  return new Response(
    JSON.stringify({ error: 'not_implemented', function: 'conflict-detector' }),
    { status: 501, headers: { ...corsHeaders, 'content-type': 'application/json' } },
  )
})
