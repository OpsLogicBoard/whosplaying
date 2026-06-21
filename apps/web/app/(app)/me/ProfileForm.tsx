'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Chip } from '@whosplaying/ui'
import { createBrowserSupabase } from '@/lib/supabase/browser'

const ROLE_OPTIONS = [
  { key: 'goer', label: 'Music goer', help: 'Follow artists and venues, save shows.' },
  { key: 'artist', label: 'Artist', help: 'Solo + band profiles, manage gigs.' },
  { key: 'venue_owner', label: 'Venue owner', help: 'Post events, invite performers, run gig board.' },
  { key: 'venue_staff', label: 'Venue staff', help: 'Answer customer questions about live music.' },
] as const

type InitialProfile = { display_name: string; home_city: string; bio: string }

export function ProfileForm({
  userId,
  email,
  initialProfile,
  initialRoles,
}: {
  userId: string
  email: string
  initialProfile: InitialProfile
  initialRoles: string[]
}) {
  const router = useRouter()
  const [displayName, setDisplayName] = useState(initialProfile.display_name)
  const [homeCity, setHomeCity] = useState(initialProfile.home_city)
  const [bio, setBio] = useState(initialProfile.bio)
  const [roles, setRoles] = useState<Set<string>>(new Set(initialRoles))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function toggleRole(role: string) {
    setRoles((prev) => {
      const next = new Set(prev)
      if (next.has(role)) next.delete(role)
      else next.add(role)
      return next
    })
  }

  async function save() {
    setSaving(true)
    setError(null)
    const supabase = createBrowserSupabase()

    const { error: pErr } = await supabase
      .from('profiles')
      .update({ display_name: displayName, home_city: homeCity || null, bio: bio || null })
      .eq('id', userId)
    if (pErr) {
      setError(pErr.message)
      setSaving(false)
      return
    }

    // Sync roles — fetch current, diff, insert/delete.
    const { data: current } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
    const currentSet = new Set((current ?? []).map((r) => r.role as string))
    const toAdd = [...roles].filter((r) => !currentSet.has(r))
    const toRemove = [...currentSet].filter((r) => !roles.has(r))

    if (toAdd.length) {
      const { error: aErr } = await supabase
        .from('user_roles')
        .insert(toAdd.map((role) => ({ user_id: userId, role })))
      if (aErr) {
        setError(aErr.message)
        setSaving(false)
        return
      }
    }
    if (toRemove.length) {
      const { error: rErr } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .in('role', toRemove)
      if (rErr) {
        setError(rErr.message)
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setSavedAt(Date.now())
    router.refresh()
  }

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-wide text-ink-mute">Signed in as</p>
        <p className="text-ink font-medium mt-1">{email}</p>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-ink">Profile</h2>
        <div className="mt-4 space-y-4">
          <Field label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={80}
              className="mt-1 w-full rounded-md border border-ink-line bg-surface px-3 py-2 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
            />
          </Field>
          <Field label="Home city">
            <input
              value={homeCity}
              onChange={(e) => setHomeCity(e.target.value)}
              placeholder="Jacksonville Beach, FL"
              className="mt-1 w-full rounded-md border border-ink-line bg-surface px-3 py-2 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
            />
          </Field>
          <Field label="Short bio">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="mt-1 w-full rounded-md border border-ink-line bg-surface px-3 py-2 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft"
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-ink">Hats you wear</h2>
        <p className="text-sm text-ink-soft mt-1">Pick any — you can change later.</p>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          {ROLE_OPTIONS.map((r) => {
            const on = roles.has(r.key)
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => toggleRole(r.key)}
                className={`text-left rounded-lg border-2 p-4 transition ${
                  on ? 'border-coral bg-coral-soft' : 'border-ink-line hover:border-ink-mute'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Chip tone={on ? 'confirmed' : 'muted'}>{on ? 'on' : 'off'}</Chip>
                  <span className="font-semibold text-ink">{r.label}</span>
                </div>
                <p className="text-sm text-ink-soft mt-1">{r.help}</p>
              </button>
            )
          })}
        </div>
      </Card>

      {error && (
        <Card accent="coral">
          <p className="text-coral-600 font-medium">Couldn&rsquo;t save</p>
          <p className="text-sm text-ink-soft mt-1">{error}</p>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={saving} size="lg">
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {savedAt && <span className="text-sm font-semibold text-green">Saved.</span>}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}
