'use client'

import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase/browser'

export function SignOutButton() {
  const router = useRouter()
  async function signOut() {
    const supabase = createBrowserSupabase()
    await supabase.auth.signOut()
    router.refresh()
    router.replace('/login')
  }
  return (
    <button
      onClick={signOut}
      className="ml-2 px-3 py-1.5 rounded-md text-sm font-medium text-ink-soft hover:bg-paper-cool"
    >
      Sign out
    </button>
  )
}
