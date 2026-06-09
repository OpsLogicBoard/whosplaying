import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'

/**
 * Handles BOTH supported magic-link return formats:
 *   1. Token-hash flow (preferred, cross-browser safe) — Supabase email
 *      template emits ?token_hash=...&type=email&next=/calendar
 *   2. PKCE code flow (legacy / default) — requires the code_verifier
 *      cookie to be present in the same browser that requested the link
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') ?? 'email'
  const next = url.searchParams.get('next') ?? '/calendar'

  const supabase = await createServerSupabase()

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as any,
    })
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
      )
    }
    return NextResponse.redirect(new URL(next, url.origin))
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
      )
    }
    return NextResponse.redirect(new URL(next, url.origin))
  }

  return NextResponse.redirect(new URL('/login?error=missing_code', url.origin))
}
