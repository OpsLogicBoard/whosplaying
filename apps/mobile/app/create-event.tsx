import {
  IconAdjustments,
  IconCamera,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconHome,
  IconLock,
  IconMapPin,
  IconPhoto,
  IconSearch,
  IconSend,
  IconShieldCheck,
} from '@tabler/icons-react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { eventsQ } from '@whosplaying/supabase'
import { Segmented, Toggle } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const HOURS = [17, 18, 19, 20, 21, 22, 23] // 5 PM – 11 PM
// Load-in / sound-check can run earlier than music; null = "Not set".
const TIME_SLOTS: (number | null)[] = [null, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]

function hourLabel(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr}:00 ${ampm}`
}

function dayLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

/**
 * Mockup-style tappable field (.finput) that opens a bottom-sheet picker.
 * Keeps the prototype's clean field look while staying functional + cross-platform.
 */
function PickerField<T>({
  value,
  options,
  optionLabel,
  isSelected,
  onSelect,
  title,
  icon,
}: {
  value: string
  options: T[]
  optionLabel: (o: T) => string
  isSelected: (o: T) => boolean
  onSelect: (o: T) => void
  title: string
  icon?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="flex-row items-center justify-between rounded-2xl border border-ink-line bg-surface px-4 py-3.5"
      >
        <View className="flex-row items-center">
          {icon}
          <Text className="text-[15px] font-semibold text-ink">{value}</Text>
        </View>
        <IconChevronDown size={18} color="#9AA1AC" strokeWidth={2} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setOpen(false)}>
          <Pressable className="max-h-[60%] rounded-t-3xl bg-surface px-5 pb-8 pt-4" onPress={() => {}}>
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-ink-line" />
            <Text className="mb-2 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              {title}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((o, i) => {
                const on = isSelected(o)
                return (
                  <Pressable
                    key={i}
                    onPress={() => {
                      onSelect(o)
                      setOpen(false)
                    }}
                    className="flex-row items-center justify-between border-b border-ink-line py-3.5"
                  >
                    <Text className={`text-[15px] ${on ? 'font-extrabold text-coral' : 'font-semibold text-ink'}`}>
                      {optionLabel(o)}
                    </Text>
                    {on ? <IconCircleCheck size={20} color="#FF5A5F" strokeWidth={2} /> : null}
                  </Pressable>
                )
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

function startOfDay(d: Date) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}

/** Section label (mockup .flabel). */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text className="mb-1.5 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">
      {children}
    </Text>
  )
}

/** Read-only/auto field row (mockup .finput non-input styling). */
function StaticField({
  children,
  muted,
  icon,
  className = '',
}: {
  children: React.ReactNode
  muted?: boolean
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <View
      className={`flex-row items-center rounded-2xl border border-ink-line bg-surface px-4 py-3.5 ${className}`}
    >
      {icon}
      <Text className={`text-[15px] font-semibold ${muted ? 'text-ink-mute' : 'text-ink'}`}>
        {children}
      </Text>
    </View>
  )
}

export default function CreateEventScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['my-first-venue', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_user_id', userId as string)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as { id: string; name: string } | null
    },
  })

  const today = useMemo(() => startOfDay(new Date()), [])
  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        return {
          offset: i,
          weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
          num: date.getDate().toString(),
          date,
        }
      }),
    [today],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [price, setPrice] = useState('')
  const [dayOffset, setDayOffset] = useState(0)
  const [hour, setHour] = useState(20)
  const [submitting, setSubmitting] = useState(false)

  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [setting, setSetting] = useState<'indoor' | 'outdoor' | 'patio'>('indoor')
  const [familyFriendly, setFamilyFriendly] = useState(true)
  const [tickets, setTickets] = useState<'free' | 'ticketed'>('free')
  const [moreOpen, setMoreOpen] = useState(false)

  // Private gig details → event_private_details (venue-writable, participant-readable).
  const [gigRate, setGigRate] = useState('')
  const [promoterNote, setPromoterNote] = useState('')
  const [loadInHour, setLoadInHour] = useState<number | null>(null)
  const [soundcheckHour, setSoundcheckHour] = useState<number | null>(null)
  const [lineupOrder, setLineupOrder] = useState('')
  // Caller's own private note → event_participant_notes (self-scoped).
  const [privateNote, setPrivateNote] = useState('')

  const venueName = venue?.name ?? 'your venue'
  const canSubmit = !!venue && !submitting

  async function submit() {
    if (!venue || !userId || !canSubmit) return
    setSubmitting(true)
    try {
      const day = days[dayOffset]?.date ?? today
      const startsAt = new Date(day)
      startsAt.setHours(hour, 0, 0, 0)
      const priceNum = Number.parseFloat(price)
      const { data: created, error } = await eventsQ.createEvent(supabase, {
        venue_id: venue.id,
        title: title.trim() || venue.name,
        starts_at: startsAt.toISOString(),
        created_by: userId,
        description: description.trim() || null,
        ticket_url: tickets === 'ticketed' ? ticketUrl.trim() || null : null,
        visibility,
        setting,
        family_friendly: familyFriendly,
        price_cents:
          tickets === 'ticketed' && Number.isFinite(priceNum) && priceNum > 0
            ? Math.round(priceNum * 100)
            : null,
      })
      if (error) throw error

      // Persist private gig details now that the event exists. These are
      // secondary to the event itself — a failure here must NOT prompt a
      // re-submit (that would duplicate the event), so surface it softly.
      const eventId = created?.id
      const timeOnDay = (h: number | null): string | null => {
        if (h == null) return null
        const t = new Date(day)
        t.setHours(h, 0, 0, 0)
        return t.toISOString()
      }
      const rate = gigRate.trim()
      const promoter = promoterNote.trim()
      const lineup = lineupOrder.trim()
      const note = privateNote.trim()
      const hasPrivateDetails =
        rate || promoter || lineup || loadInHour != null || soundcheckHour != null

      let privateError: Error | null = null
      if (eventId && hasPrivateDetails) {
        const { error: e } = await eventsQ.upsertEventPrivateDetails(supabase, {
          event_id: eventId,
          gig_rate: rate || null,
          promoter_note: promoter || null,
          load_in_at: timeOnDay(loadInHour),
          soundcheck_at: timeOnDay(soundcheckHour),
          lineup_order: lineup || null,
          updated_by: userId,
        })
        if (e) privateError = e
      }
      if (eventId && note) {
        const { error: e } = await eventsQ.upsertEventParticipantNote(supabase, {
          event_id: eventId,
          user_id: userId,
          note,
        })
        if (e) privateError = e
      }

      await Promise.all([
        qc.invalidateQueries({ queryKey: ['events'] }),
        qc.invalidateQueries({ queryKey: ['hosted-events'] }),
      ])
      if (privateError) {
        Alert.alert(
          'Event published',
          'Your event is live, but the private gig details didn’t save. You can add them from the event later.',
        )
      }
      router.replace('/calendar')
    } catch (e) {
      Alert.alert('Couldn’t publish the event', e instanceof Error ? e.message : 'Please try again.')
      setSubmitting(false)
    }
  }

  const free = tickets === 'free'

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-12 pt-2">
        {/* Header: title + "Duplicate past" pill */}
        <View className="mb-3.5 flex-row items-center justify-between">
          <Text className="text-[26px] font-extrabold text-ink-deep">Create event</Text>
          <View className="flex-row items-center gap-1.5 rounded-full bg-[#F2F3F6] px-3 py-1.5">
            <IconCopy size={14} color="#5C6470" strokeWidth={2} />
            <Text className="text-[12px] font-bold text-ink-slate">Duplicate past</Text>
          </View>
        </View>

        {venueLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : !venue ? (
          <View className="mt-12 items-center px-6">
            <IconHome size={28} color="#9AA1AC" strokeWidth={2} />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue before posting events.
            </Text>
          </View>
        ) : (
          <>
            {/* Cover image picker */}
            <View className="h-[140px] justify-between rounded-[18px] border border-ink-line bg-[#23272F] p-3">
              <Pressable className="h-9 w-9 items-center justify-center self-end rounded-full bg-white">
                <IconCamera size={18} color="#071020" strokeWidth={2} />
              </Pressable>
              <View className="flex-row items-center gap-1.5 self-start rounded-full bg-black/40 px-3 py-1.5">
                <IconPhoto size={14} color="#FFFFFF" strokeWidth={2} />
                <Text className="text-[12px] font-bold text-white">Using {venueName} cover</Text>
              </View>
            </View>

            {/* Visibility */}
            <FieldLabel>Visibility</FieldLabel>
            <Segmented
              value={visibility}
              onChange={setVisibility}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
              ]}
            />

            {/* Artist (auto) */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <Text className="text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">
                Artist
              </Text>
              <View className="rounded-full bg-green-soft px-2 py-0.5">
                <Text className="text-[10px] font-extrabold uppercase text-green">auto</Text>
              </View>
            </View>
            <StaticField>The Firewater Tent Revival</StaticField>

            {/* Venue / location (auto) */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <Text className="text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">
                Venue / location
              </Text>
              <View className="rounded-full bg-green-soft px-2 py-0.5">
                <Text className="text-[10px] font-extrabold uppercase text-green">auto</Text>
              </View>
            </View>
            <StaticField icon={<IconMapPin size={16} color="#FF5A5F" strokeWidth={2} style={{ marginRight: 7 }} />}>
              {venue.name}
            </StaticField>

            {/* Genre (from artist) */}
            <View className="mb-1.5 mt-4 flex-row items-center gap-2">
              <Text className="text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">
                Genre
              </Text>
              <View className="rounded-full bg-green-soft px-2 py-0.5">
                <Text className="text-[10px] font-extrabold uppercase text-green">from artist</Text>
              </View>
            </View>
            <StaticField>Rock · roots</StaticField>

            {/* Event title · optional */}
            <FieldLabel>Event title · optional</FieldLabel>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Add a title (optional)"
              placeholderTextColor="#9AA1AC"
              className="rounded-2xl border border-ink-line bg-surface px-4 py-3.5 text-[15px] text-ink"
            />

            {/* Date */}
            <FieldLabel>Date</FieldLabel>
            <PickerField
              title="Pick a date"
              value={dayLabel(days[dayOffset]?.date ?? today)}
              options={days}
              optionLabel={(d) => dayLabel(d.date)}
              isSelected={(d) => d.offset === dayOffset}
              onSelect={(d) => setDayOffset(d.offset)}
            />

            {/* Music start / end */}
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FieldLabel>Music start</FieldLabel>
                <PickerField
                  title="Music start"
                  value={hourLabel(hour)}
                  options={HOURS}
                  optionLabel={(h) => hourLabel(h)}
                  isSelected={(h) => h === hour}
                  onSelect={(h) => setHour(h)}
                />
              </View>
              <View className="flex-1">
                <FieldLabel>Music end</FieldLabel>
                <StaticField muted>11:30 PM</StaticField>
              </View>
            </View>

            {/* Setting */}
            <FieldLabel>Setting</FieldLabel>
            <Segmented
              value={setting}
              onChange={setSetting}
              options={[
                { value: 'indoor', label: 'Indoor' },
                { value: 'outdoor', label: 'Outdoor' },
                { value: 'patio', label: 'Patio' },
              ]}
            />

            {/* Family-friendly toggle */}
            <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-ink-line bg-surface px-4 py-3.5">
              <Text className="text-[15px] font-bold text-ink">Family-friendly event</Text>
              <Toggle on={familyFriendly} onToggle={() => setFamilyFriendly((v) => !v)} />
            </View>

            {/* Tickets */}
            <FieldLabel>Tickets</FieldLabel>
            <Segmented
              value={tickets}
              onChange={setTickets}
              options={[
                { value: 'free', label: 'Free' },
                { value: 'ticketed', label: 'Ticketed' },
              ]}
            />
            <View className="mt-2 flex-row gap-3" style={{ opacity: free ? 0.45 : 1 }}>
              <TextInput
                value={price}
                onChangeText={setPrice}
                editable={!free}
                placeholder="Price"
                placeholderTextColor="#9AA1AC"
                keyboardType="number-pad"
                className="flex-1 rounded-2xl border border-ink-line bg-surface px-4 py-3.5 text-[15px] text-ink"
              />
              <TextInput
                value={ticketUrl}
                onChangeText={setTicketUrl}
                editable={!free}
                placeholder="Ticket link"
                placeholderTextColor="#9AA1AC"
                autoCapitalize="none"
                keyboardType="url"
                className="flex-[1.3] rounded-2xl border border-ink-line bg-surface px-4 py-3.5 text-[15px] text-ink"
              />
            </View>

            {/* Event details */}
            <FieldLabel>Event details</FieldLabel>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Describe the night — vibe, openers, what to expect…"
              placeholderTextColor="#9AA1AC"
              multiline
              className="min-h-[76px] rounded-2xl border border-ink-line bg-surface px-4 py-3.5 text-[15px] text-ink"
              textAlignVertical="top"
            />

            {/* Invite performers */}
            <FieldLabel>Invite performers · Who’s Playing profiles</FieldLabel>
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="flex-row items-center gap-1.5 rounded-full bg-[#E1F5EE] px-3 py-1.5">
                <Text className="text-[12px] font-bold text-[#0F6E56]">The Tide</Text>
                <IconCircleCheck size={14} color="#0F6E56" strokeWidth={2} />
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-[#FAEEDA] px-3 py-1.5">
                <Text className="text-[12px] font-bold text-[#854F0B]">Chloe Kimes</Text>
                <IconClock size={14} color="#854F0B" strokeWidth={2} />
              </View>
              <View className="flex-row items-center gap-1.5 rounded-full bg-[#F2F3F6] px-3 py-1.5">
                <IconSearch size={14} color="#5C6470" strokeWidth={2} />
                <Text className="text-[12px] font-bold text-ink-slate">Add profile</Text>
              </View>
            </View>
            <Text className="mt-2 text-[12px] font-semibold text-ink-mute">
              Age limit is set by the venue — <Text className="font-extrabold text-ink-slate">21+</Text> at {venue.name}.
            </Text>

            {/* ===== PRIVATE GIG DETAILS ===== */}
            <View className="mt-5 rounded-[18px] border border-ink-line bg-[#F7F8FA] p-4">
              <View className="flex-row items-center gap-2">
                <IconLock size={16} color="#071020" strokeWidth={2} />
                <Text className="text-[15px] font-extrabold text-ink-deep">Private gig details</Text>
              </View>
              <Text className="mb-2.5 mt-1.5 text-[12px] font-semibold text-ink-mute">
                Not shown publicly — visible to you, the venue, and invited performers.
              </Text>

              <FieldLabel>Gig rate</FieldLabel>
              <TextInput
                value={gigRate}
                onChangeText={setGigRate}
                placeholder="e.g. $350 guarantee + bar split"
                placeholderTextColor="#9AA1AC"
                maxLength={200}
                className="rounded-2xl border border-ink-line bg-white px-4 py-3.5 text-[15px] text-ink"
              />

              <FieldLabel>Promoter / booking note</FieldLabel>
              <TextInput
                value={promoterNote}
                onChangeText={setPromoterNote}
                placeholder="Promoter, booking contact, or deal terms"
                placeholderTextColor="#9AA1AC"
                maxLength={500}
                className="rounded-2xl border border-ink-line bg-white px-4 py-3.5 text-[15px] text-ink"
              />

              {/* Expandable More · load-in, sound check, lineup */}
              <Pressable
                onPress={() => setMoreOpen((v) => !v)}
                className="mt-3 flex-row items-center justify-between rounded-2xl border border-ink-line bg-white px-4 py-3"
              >
                <View className="flex-row items-center gap-2">
                  <IconAdjustments size={16} color="#FF5A5F" strokeWidth={2} />
                  <Text className="text-[13.5px] font-bold text-ink">
                    More · load-in, sound check, lineup
                  </Text>
                </View>
                <View style={{ transform: [{ rotate: moreOpen ? '180deg' : '0deg' }] }}>
                  <IconChevronDown size={16} color="#5C6470" strokeWidth={2} />
                </View>
              </Pressable>

              {moreOpen ? (
                <View>
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <FieldLabel>Load-in</FieldLabel>
                      <PickerField
                        title="Load-in time"
                        value={loadInHour == null ? 'Set time' : hourLabel(loadInHour)}
                        options={TIME_SLOTS}
                        optionLabel={(h) => (h == null ? 'Not set' : hourLabel(h))}
                        isSelected={(h) => h === loadInHour}
                        onSelect={setLoadInHour}
                      />
                    </View>
                    <View className="flex-1">
                      <FieldLabel>Sound check</FieldLabel>
                      <PickerField
                        title="Sound-check time"
                        value={soundcheckHour == null ? 'Set time' : hourLabel(soundcheckHour)}
                        options={TIME_SLOTS}
                        optionLabel={(h) => (h == null ? 'Not set' : hourLabel(h))}
                        isSelected={(h) => h === soundcheckHour}
                        onSelect={setSoundcheckHour}
                      />
                    </View>
                  </View>
                  <FieldLabel>Lineup order</FieldLabel>
                  <TextInput
                    value={lineupOrder}
                    onChangeText={setLineupOrder}
                    placeholder="e.g. Headliner, or Opener → The Tide"
                    placeholderTextColor="#9AA1AC"
                    maxLength={200}
                    className="rounded-2xl border border-ink-line bg-white px-4 py-3.5 text-[15px] text-ink"
                  />
                </View>
              ) : null}

              <FieldLabel>Your private notes</FieldLabel>
              <TextInput
                value={privateNote}
                onChangeText={setPrivateNote}
                placeholder="Notes only you can see…"
                placeholderTextColor="#9AA1AC"
                multiline
                maxLength={1000}
                textAlignVertical="top"
                className="min-h-[56px] rounded-2xl border border-ink-line bg-white px-4 py-3.5 text-[15px] text-ink"
              />
              <Text className="mt-2 text-[12px] font-semibold text-ink-mute">
                Each participant keeps their own private notes for this event.
              </Text>
            </View>

            {/* Cross-confirmation banner */}
            <View className="mt-4 flex-row items-start gap-2 rounded-[13px] bg-[#E1F5EE] p-3">
              <IconShieldCheck size={17} color="#0F6E56" strokeWidth={2} style={{ marginTop: 1 }} />
              <Text className="flex-1 text-[12.5px] font-semibold leading-5 text-[#0F6E56]">
                Goes live as <Text className="font-extrabold">Confirmed</Text> only once you and every
                invited performer accept.
              </Text>
            </View>
            <Text className="mb-3 mt-2 text-[12px] font-semibold text-ink-mute">
              Once live, you, the venue, and invited performers can update start/end, details, and the
              lineup.
            </Text>

            {/* CTA */}
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={{ opacity: canSubmit ? 1 : 0.5 }}
              className="flex-row items-center justify-center gap-2 rounded-[15px] bg-coral py-4"
            >
              <IconSend size={18} color="#FFFFFF" strokeWidth={2} />
              <Text className="text-[15px] font-extrabold text-white">
                {submitting ? 'Publishing…' : 'Send invites & publish'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
