'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card } from '@whosplaying/ui'
import { createBrowserSupabase } from '@/lib/supabase/browser'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
}

export function NewVenueForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [capacity, setCapacity] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [icsFeedUrl, setIcsFeedUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveSlug = useMemo(
    () => (slugTouched ? slug : slugify(name)),
    [slugTouched, slug, name],
  )

  function fieldError(): string | null {
    if (!name.trim()) return 'Name is required.'
    if (!effectiveSlug || !/^[a-z0-9-]+$/.test(effectiveSlug))
      return 'Slug must be lowercase letters, numbers, and dashes.'
    if (!address.trim()) return 'Address is required.'
    if (!city.trim()) return 'City is required.'
    if (!region.trim()) return 'Region is required.'
    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (!Number.isFinite(latNum) || latNum < -90 || latNum > 90) return 'Latitude must be between -90 and 90.'
    if (!Number.isFinite(lngNum) || lngNum < -180 || lngNum > 180) return 'Longitude must be between -180 and 180.'
    if (capacity && (!Number.isInteger(Number(capacity)) || Number(capacity) <= 0))
      return 'Capacity must be a positive integer.'
    return null
  }

  async function save() {
    const v = fieldError()
    if (v) {
      setError(v)
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createBrowserSupabase()

    const { data, error: insErr } = await supabase
      .from('venues')
      .insert({
        owner_user_id: userId,
        slug: effectiveSlug,
        name: name.trim(),
        description: description.trim() || null,
        address: address.trim(),
        city: city.trim(),
        region: region.trim(),
        postal_code: postalCode.trim() || null,
        lat: Number(lat),
        lng: Number(lng),
        capacity: capacity ? Number(capacity) : null,
        hero_image_url: heroImageUrl.trim() || null,
        ics_feed_url: icsFeedUrl.trim() || null,
      })
      .select('slug')
      .single()

    if (insErr) {
      setSaving(false)
      if (insErr.code === '23505') {
        setError(`Slug "${effectiveSlug}" is already taken. Pick another.`)
      } else {
        setError(insErr.message)
      }
      return
    }

    router.push(`/venue/${data!.slug}`)
    router.refresh()
  }

  return (
    <div className="mt-6 space-y-6">
      <Card>
        <h2 className="font-display text-2xl text-ink">Basics</h2>
        <div className="mt-4 space-y-4">
          <Field label="Venue name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              placeholder="The Brick Room"
              className={inputCls}
            />
          </Field>
          <Field label="URL slug" hint="Used in /venue/<slug>. We auto-fill from the name.">
            <input
              value={effectiveSlug}
              onChange={(e) => {
                setSlugTouched(true)
                setSlug(e.target.value)
              }}
              maxLength={64}
              placeholder="the-brick-room"
              className={inputCls}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={800}
              rows={3}
              placeholder="Who you are, what kind of music plays here."
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-ink">Location</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          <Field label="Address" className="sm:col-span-2">
            <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputCls} />
          </Field>
          <Field label="City">
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Region / state">
            <input value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Postal code">
            <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className={inputCls} />
          </Field>
          <Field label="Capacity">
            <input
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              inputMode="numeric"
              placeholder="120"
              className={inputCls}
            />
          </Field>
          <Field label="Latitude" hint="-90 to 90. Geocoding helper comes later.">
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              inputMode="decimal"
              placeholder="30.2880"
              className={inputCls}
            />
          </Field>
          <Field label="Longitude" hint="-180 to 180.">
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              inputMode="decimal"
              placeholder="-81.3931"
              className={inputCls}
            />
          </Field>
        </div>
      </Card>

      <Card>
        <h2 className="font-display text-2xl text-ink">Optional</h2>
        <div className="mt-4 space-y-4">
          <Field label="Hero image URL">
            <input
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              placeholder="https://…"
              className={inputCls}
            />
          </Field>
          <Field label="ICS calendar feed URL" hint="If your venue already publishes a calendar feed.">
            <input
              value={icsFeedUrl}
              onChange={(e) => setIcsFeedUrl(e.target.value)}
              placeholder="https://…/calendar.ics"
              className={inputCls}
            />
          </Field>
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
          {saving ? 'Creating…' : 'Create venue'}
        </Button>
        <button
          onClick={() => router.back()}
          className="text-ink-soft hover:text-ink px-3 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

const inputCls =
  'mt-1 w-full rounded-md border border-ink-line bg-surface px-3 py-2 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral-soft'

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="text-sm font-medium text-ink">{label}</span>
      {hint && <span className="block text-xs text-ink-mute mt-0.5">{hint}</span>}
      {children}
    </label>
  )
}
