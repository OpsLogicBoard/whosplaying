import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Card } from '@whosplaying/ui'
import { createServerSupabase } from '@/lib/supabase/server'

export default async function MyVenuesPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: venues } = await supabase
    .from('venues')
    .select('id, slug, name, city, region, is_verified')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })

  const list = venues ?? []

  return (
    <section>
      <p className="text-sm text-ink-mute">
        <Link href="/me" className="hover:text-ink">
          ← Me
        </Link>
      </p>
      <div className="mt-1 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Your venues</h1>
          <p className="text-ink-soft mt-1">Places you own. Post events from each one.</p>
        </div>
        <Link
          href="/me/venues/new"
          className="bg-coral text-white px-5 py-3 rounded-lg font-semibold shadow-stack-yellow"
        >
          + Add venue
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <Card>
            <p className="text-ink">No venues yet.</p>
            <p className="text-sm text-ink-soft mt-1">
              Add one to start posting events and inviting performers.
            </p>
          </Card>
        )}
        {list.map((v) => (
          <Link key={v.id} href={`/venue/${v.slug}`} className="block">
            <Card>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-xl text-ink">{v.name}</p>
                  <p className="text-sm text-ink-soft">
                    {v.city}, {v.region} · /{v.slug}
                  </p>
                </div>
                {!v.is_verified && (
                  <span className="text-xs text-ink-mute uppercase tracking-wide">Unverified</span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}
