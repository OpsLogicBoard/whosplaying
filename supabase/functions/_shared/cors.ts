// Dynamic CORS. These functions accept JWTs/credentials, so we never use
// `Access-Control-Allow-Origin: *`. We echo the request Origin only when it is
// allowlisted, otherwise fall back to the production origin.
//
// Usage in a function:
//   import { getCorsHeaders } from '../_shared/cors.ts'
//   Deno.serve((req) => {
//     const corsHeaders = getCorsHeaders(req.headers.get('Origin') ?? '')
//     if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
//     ...
//   })
//
// Native mobile (Expo) requests send no Origin header and ignore CORS, so the
// fallback value is harmless for them.

const ALLOWED_ORIGINS = [
  'http://localhost:3000', // web dev (Next.js)
  'http://localhost:8081', // expo dev server
  'http://localhost:19006', // expo web
]

const ALLOWED_PATTERNS = [
  /^https:\/\/(www\.)?whosplaying\.live$/, // production web
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/, // Vercel preview deploys
]

const FALLBACK_ORIGIN = 'https://whosplaying.live'

export function getCorsHeaders(origin: string) {
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    ALLOWED_PATTERNS.some((re) => re.test(origin))
  return {
    'Access-Control-Allow-Origin': allowed ? origin : FALLBACK_ORIGIN,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  }
}
