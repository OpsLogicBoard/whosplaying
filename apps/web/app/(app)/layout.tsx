import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Wordmark } from '@whosplaying/ui'
import { createServerSupabase } from '@/lib/supabase/server'
import { SignOutButton } from './SignOutButton'

const tabs = [
  { href: '/calendar', label: 'Calendar' },
  { href: '/map', label: 'Map' },
  { href: '/feed', label: 'Feed' },
  { href: '/messages', label: 'Messages' },
  { href: '/me', label: 'Me' },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-paper border-b border-ink-line sticky top-0 z-10">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
          <Link href="/calendar" aria-label="Who's Playing home">
            <Wordmark width={160} />
          </Link>
          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="px-3 py-2 rounded-md text-sm font-medium text-ink hover:bg-paper-cool"
              >
                {t.label}
              </Link>
            ))}
            <span className="ml-3 text-xs text-ink-mute hidden sm:inline">{user.email}</span>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main className="flex-1 mx-auto max-w-6xl w-full p-4">{children}</main>
    </div>
  )
}
