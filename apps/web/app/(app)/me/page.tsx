import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { ProfileForm } from './ProfileForm'

export default async function MePage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('user_roles').select('role').eq('user_id', user.id),
  ])

  return (
    <section>
      <h1 className="font-display text-4xl">Me</h1>
      <p className="text-ink-soft mt-1">Your profile and the hats you wear.</p>
      <p className="mt-3 flex gap-4 text-sm">
        <Link href="/me/venues" className="text-coral hover:text-coral-strong font-semibold">
          Your venues →
        </Link>
        <Link href="/me/billing" className="text-coral hover:text-coral-strong font-semibold">
          Billing &amp; plan →
        </Link>
      </p>
      <ProfileForm
        userId={user.id}
        email={user.email ?? ''}
        initialProfile={{
          display_name: profile?.display_name ?? user.email?.split('@')[0] ?? '',
          home_city: profile?.home_city ?? '',
          bio: profile?.bio ?? '',
        }}
        initialRoles={(roles ?? []).map((r) => r.role) as string[]}
      />
    </section>
  )
}
