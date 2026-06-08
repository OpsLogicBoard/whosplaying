import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabase/server'
import { NewVenueForm } from './NewVenueForm'

export default async function NewVenuePage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <section>
      <p className="text-sm text-ink-mute">
        <Link href="/me/venues" className="hover:text-ink">
          ← Your venues
        </Link>
      </p>
      <h1 className="font-display text-4xl mt-1">New venue</h1>
      <p className="text-ink-soft mt-1">
        Add a place where shows happen. You become the owner and can invite staff later.
      </p>
      <NewVenueForm userId={user.id} />
    </section>
  )
}
