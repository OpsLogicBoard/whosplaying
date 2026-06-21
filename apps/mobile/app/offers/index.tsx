import {
  IconCalendarEvent,
  IconCalendarRepeat,
  IconCheck,
  IconClockHour4,
  IconDiscount,
  IconHome,
  IconMapPin,
  IconPlus,
  IconQrcode,
  IconRepeat,
  IconTrash,
} from '@tabler/icons-react-native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { offersQ } from '@whosplaying/supabase'
import { BackHeader, GradientButton, Segmented, StatusBadge, Toggle, type StatusKind } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

type OfferRow = {
  id: string
  message: string
  active: boolean
  expiration_date: string | null
}

function offerStatus(o: OfferRow): { kind: StatusKind; label: string } {
  if (!o.active) return { kind: 'muted', label: 'Paused' }
  if (o.expiration_date && new Date(o.expiration_date) < new Date()) return { kind: 'muted', label: 'Expired' }
  if (o.expiration_date) {
    const days = (new Date(o.expiration_date).getTime() - Date.now()) / 86400000
    if (days <= 3) return { kind: 'wait', label: 'Expiring' }
  }
  return { kind: 'confirmed', label: 'Active' }
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function OffersScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [composing, setComposing] = useState(false)
  const [message, setMessage] = useState('')
  const [onEventPages, setOnEventPages] = useState(true)
  const [notifyNearby, setNotifyNearby] = useState(true)
  const [offerActive, setOfferActive] = useState(true)
  const [schedule, setSchedule] = useState<'recurring' | 'onetime'>('recurring')
  const [radius, setRadius] = useState<'0.5' | '1' | '3'>('1')
  const [days, setDays] = useState<Record<string, boolean>>({ Fr: true })

  const venue = useQuery({
    queryKey: ['my-venue', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_user_id', userId as string)
        .limit(1)
      return ((data ?? []) as { id: string; name: string }[])[0] ?? null
    },
  })
  const venueId = venue.data?.id
  const venueName = venue.data?.name ?? '…'

  const offers = useQuery({
    queryKey: ['venue-offers', venueId ?? null],
    enabled: !!venueId,
    queryFn: async (): Promise<OfferRow[]> => {
      const { data, error } = await offersQ.listVenueOffers(supabase, venueId as string)
      if (error) throw error
      return (data ?? []) as unknown as OfferRow[]
    },
  })

  const create = useMutation({
    mutationFn: async () => {
      const { error } = await offersQ.createOffer(supabase, {
        venue_id: venueId as string,
        created_by: userId as string,
        message: message.trim(),
        on_event_pages: onEventPages,
        active: offerActive,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setMessage('')
      setComposing(false)
      qc.invalidateQueries({ queryKey: ['venue-offers', venueId] })
    },
    onError: () =>
      Alert.alert('Offer limit', 'Free venues include one active offer. Upgrade to Venue Pro for unlimited offers.'),
  })

  const del = useMutation({
    mutationFn: async (offerId: string) => {
      const { error } = await supabase.from('offers').delete().eq('id', offerId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venue-offers', venueId] }),
  })

  const all = offers.data ?? []
  const expired = all.filter((o) => offerStatus(o).label === 'Expired')
  const live = all.filter((o) => offerStatus(o).label !== 'Expired')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Offers & promos" onBack={() => (composing ? setComposing(false) : router.back())} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {!venue.isLoading && !venueId ? (
          <View className="mt-16 items-center px-6">
            <IconHome size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue to run redeemable offers on your event pages.
            </Text>
          </View>
        ) : (
          <>
            {/* Scope card */}
            <View className="mb-4 flex-row items-center gap-3 rounded-[14px] border border-ink-line bg-surface p-3 shadow-card">
              <View className="h-10 w-10 items-center justify-center rounded-[11px] bg-blue">
                <Text className="text-[14px] font-extrabold text-white">{venueName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Offers for</Text>
                <Text className="text-[14.5px] font-extrabold text-ink">{venueName}</Text>
              </View>
              <Pressable onPress={() => router.back()}>
                <Text className="text-[12.5px] font-extrabold text-coral">Change venue</Text>
              </Pressable>
            </View>

            {composing ? (
              <EditorView
                message={message}
                setMessage={setMessage}
                schedule={schedule}
                setSchedule={setSchedule}
                days={days}
                setDays={setDays}
                onEventPages={onEventPages}
                setOnEventPages={setOnEventPages}
                notifyNearby={notifyNearby}
                setNotifyNearby={setNotifyNearby}
                radius={radius}
                setRadius={setRadius}
                offerActive={offerActive}
                setOfferActive={setOfferActive}
                venueName={venueName}
                saving={create.isPending}
                onSave={() => create.mutate()}
              />
            ) : (
              <>
                <GradientButton label="New offer" icon={IconPlus} onPress={() => setComposing(true)} />

                {offers.isLoading ? (
                  <View className="mt-8 items-center">
                    <ActivityIndicator color="#FF5A5F" />
                  </View>
                ) : all.length === 0 ? (
                  <View className="mt-10 items-center px-6">
                    <IconDiscount size={26} color="#9AA1AC" />
                    <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
                      No offers yet — create one to reward fans at the bar.
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text className="mb-1 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
                      Active &amp; scheduled
                    </Text>
                    {live.map((o) => (
                      <OfferRowView key={o.id} offer={o} onPress={() => setComposing(true)} />
                    ))}
                    {expired.length > 0 ? (
                      <>
                        <Text className="mb-1 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
                          Expired
                        </Text>
                        {expired.map((o) => (
                          <OfferRowView
                            key={o.id}
                            offer={o}
                            expired
                            onDelete={() => del.mutate(o.id)}
                          />
                        ))}
                      </>
                    ) : null}
                    <Text className="mt-3 px-1 text-[12px] font-semibold leading-5 text-ink-mute">
                      Expired offers can be deleted. Managing several venues? Switch the active venue from your profile —
                      each keeps its own offers.
                    </Text>
                  </>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function OfferRowView({
  offer,
  expired,
  onPress,
  onDelete,
}: {
  offer: OfferRow
  expired?: boolean
  onPress?: () => void
  onDelete?: () => void
}) {
  const s = offerStatus(offer)
  const dateLine = offer.expiration_date
    ? `Expires ${new Date(offer.expiration_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : 'No end date'
  return (
    <Pressable
      onPress={onPress}
      className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3 shadow-card"
    >
      <View
        className="h-[52px] w-[52px] items-center justify-center rounded-[13px]"
        style={{ backgroundColor: expired ? '#EEF0F4' : '#E1F5EE' }}
      >
        {expired ? (
          <IconClockHour4 size={20} color="#9AA1AC" />
        ) : (
          <IconRepeat size={20} color="#0F6E56" />
        )}
        <Text className="mt-0.5 text-[9px] font-extrabold" style={{ color: expired ? '#9AA1AC' : '#0F6E56' }}>
          {expired ? 'Past' : 'Fri'}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-extrabold text-ink" numberOfLines={1}>
          {offer.message}
        </Text>
        <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">Every Fri · 6 PM–Close</Text>
        <Text className="mt-0.5 text-[11.5px] font-semibold text-ink-mute">{dateLine}</Text>
      </View>
      <View className="items-end gap-1.5">
        <StatusBadge kind={s.kind} label={s.label} />
        {expired && onDelete ? (
          <Pressable onPress={onDelete} className="p-1">
            <IconTrash size={16} color="#9AA1AC" />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  )
}

function FLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">{children}</Text>
  )
}

function FBox({ children }: { children: string }) {
  return (
    <View className="rounded-2xl border border-ink-line bg-surface px-4 py-3">
      <Text className="text-[14.5px] font-semibold text-ink">{children}</Text>
    </View>
  )
}

function ToggleRow({ icon, label, on, onToggle }: { icon?: typeof IconMapPin; label: string; on: boolean; onToggle: () => void }) {
  const Icon = icon
  return (
    <View className="flex-row items-center justify-between border-b border-ink-line py-3.5">
      <View className="flex-1 flex-row items-center gap-2">
        {Icon ? <Icon size={17} color="#FF5A5F" /> : null}
        <Text className="text-[14px] font-semibold text-ink">{label}</Text>
      </View>
      <Toggle on={on} onToggle={onToggle} />
    </View>
  )
}

function EditorView(props: {
  message: string
  setMessage: (v: string) => void
  schedule: 'recurring' | 'onetime'
  setSchedule: (v: 'recurring' | 'onetime') => void
  days: Record<string, boolean>
  setDays: (v: Record<string, boolean>) => void
  onEventPages: boolean
  setOnEventPages: (v: boolean) => void
  notifyNearby: boolean
  setNotifyNearby: (v: boolean) => void
  radius: '0.5' | '1' | '3'
  setRadius: (v: '0.5' | '1' | '3') => void
  offerActive: boolean
  setOfferActive: (v: boolean) => void
  venueName: string
  saving: boolean
  onSave: () => void
}) {
  const {
    message,
    setMessage,
    schedule,
    setSchedule,
    days,
    setDays,
    onEventPages,
    setOnEventPages,
    notifyNearby,
    setNotifyNearby,
    radius,
    setRadius,
    offerActive,
    setOfferActive,
    venueName,
    saving,
    onSave,
  } = props
  return (
    <View>
      <FLabel>Offer message</FLabel>
      <TextInput
        value={message}
        onChangeText={setMessage}
        multiline
        placeholder="$4 SunCruisers — show this QR to your bartender or wait staff!"
        placeholderTextColor="#9AA1AC"
        className="min-h-[62px] rounded-2xl border border-ink-line bg-surface p-3.5 text-[14px] text-ink"
        textAlignVertical="top"
      />

      <FLabel>Schedule</FLabel>
      <Segmented
        value={schedule}
        onChange={setSchedule}
        options={[
          { value: 'recurring', label: 'Recurring' },
          { value: 'onetime', label: 'One-time' },
        ]}
      />

      {schedule === 'recurring' ? (
        <>
          <FLabel>Repeat on</FLabel>
          <View className="flex-row justify-between">
            {DAYS.map((d) => {
              const on = !!days[d]
              return (
                <Pressable
                  key={d}
                  onPress={() => setDays({ ...days, [d]: !on })}
                  className={`h-10 w-10 items-center justify-center rounded-full border ${on ? 'border-coral bg-coral' : 'border-ink-line bg-surface'}`}
                >
                  <Text className={`text-[12.5px] font-extrabold ${on ? 'text-white' : 'text-ink-slate'}`}>{d}</Text>
                </Pressable>
              )
            })}
          </View>
        </>
      ) : null}

      <View className="flex-row gap-3">
        <View className="flex-1">
          <FLabel>Starts</FLabel>
          <FBox>6:00 PM</FBox>
        </View>
        <View className="flex-1">
          <FLabel>Ends</FLabel>
          <FBox>Close</FBox>
        </View>
      </View>
      <View className="flex-row gap-3">
        <View className="flex-1">
          <FLabel>From</FLabel>
          <FBox>Jul 1, 2026</FBox>
        </View>
        <View className="flex-1">
          <FLabel>Until · expires</FLabel>
          <FBox>Jul 31, 2026</FBox>
        </View>
      </View>
      <View className="mt-2 flex-row items-start gap-1.5 px-1">
        <IconCalendarRepeat size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
        <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-mute">
          Runs every Fri, 6:00 PM–Close, through Jul 31 — then auto-expires.
        </Text>
      </View>

      <FLabel>Redemption code</FLabel>
      <View className="items-center rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
        <QrPlaceholder />
        <Text className="mt-3 px-2 text-center text-[12px] font-semibold leading-5 text-ink-mute">
          Goers reveal this QR in the app and show it to your bar or wait staff to redeem.
        </Text>
      </View>

      <FLabel>Where it appears</FLabel>
      <ToggleRow icon={IconCalendarEvent} label="On this venue's event pages" on={onEventPages} onToggle={() => setOnEventPages(!onEventPages)} />
      <ToggleRow icon={IconMapPin} label="Notify goers nearby (GPS)" on={notifyNearby} onToggle={() => setNotifyNearby(!notifyNearby)} />
      <Text className="mt-2 px-1 text-[12px] font-semibold leading-5 text-ink-mute">
        Sends a push when a goer is browsing events near you or comes within range of the venue.
      </Text>

      <FLabel>Notify within</FLabel>
      <Segmented
        value={radius}
        onChange={setRadius}
        options={[
          { value: '0.5', label: '0.5 mi' },
          { value: '1', label: '1 mi' },
          { value: '3', label: '3 mi' },
        ]}
      />

      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-[14px] font-semibold text-ink">Offer active</Text>
        <Toggle on={offerActive} onToggle={() => setOfferActive(!offerActive)} />
      </View>

      <FLabel>How goers see it on the event page</FLabel>
      <View
        className="items-center rounded-2xl border-[1.5px] px-4 py-4"
        style={{ borderColor: '#F2D58A', backgroundColor: '#FFF7E6' }}
      >
        <View className="flex-row items-center gap-1.5">
          <IconDiscount size={12} color="#9A6A00" />
          <Text className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: '#9A6A00' }}>
            Venue offer
          </Text>
        </View>
        <Text className="mt-2 text-center text-[15px] font-bold leading-snug" style={{ color: '#071020' }}>
          {message.trim() || '$4 SunCruisers'}
        </Text>
        <Text className="mt-1.5 text-center text-[12.5px] font-semibold" style={{ color: '#8A6A2A' }}>
          Show this QR to your bartender or wait staff!
        </Text>
        <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-ink-deep px-5 py-3">
          <IconQrcode size={15} color="#FFFFFF" />
          <Text className="text-[13.5px] font-extrabold text-white">Reveal QR to redeem</Text>
        </View>
        <Text className="mt-3 text-[11px] font-bold" style={{ color: '#B08A3A' }}>
          From {venueName} · Fridays in July
        </Text>
      </View>

      <View className="mt-5">
        <GradientButton label={saving ? 'Saving…' : 'Save offer'} icon={IconCheck} disabled={saving || !message.trim()} onPress={onSave} />
      </View>
    </View>
  )
}

/** Styled QR placeholder (no QR lib) — a checkerboard square. */
function QrPlaceholder({ size = 132 }: { size?: number }) {
  const cells = 11
  const cell = size / cells
  return (
    <View className="rounded-xl border border-ink-line bg-white p-3">
      <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: cells * cells }).map((_, i) => {
          const r = Math.floor(i / cells)
          const c = i % cells
          const corner = (r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3)
          const on = corner || (r + c) % 2 === 0 || (i * 7) % 5 === 0
          return <View key={i} style={{ width: cell, height: cell, backgroundColor: on ? '#071020' : '#FFFFFF' }} />
        })}
      </View>
    </View>
  )
}
