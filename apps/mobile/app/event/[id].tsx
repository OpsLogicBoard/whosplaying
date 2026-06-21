import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconDiscount,
  IconHeart,
  IconHeartFilled,
  IconMapPin,
  IconNavigation,
  IconQrcode,
  IconShare,
  IconTicket,
  IconWifiOff,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvent } from '@whosplaying/core'
import { billingQ } from '@whosplaying/supabase'
import { GradientButton, Scrim } from '../../components/ui'
import { supabase } from '../../lib/supabase'

// Overlapping lineup avatar colors (cycled).
const AV_COLORS = ['#23272F', '#2D7FF9', '#8B5CF6', '#FFB020', '#1D9E75']

type LineupMember = { id: string; type: 'artist' | 'band'; name: string }

function whenLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: event, isLoading, error } = useEvent(id)
  const [saved, setSaved] = useState(false)
  const [offerRevealed, setOfferRevealed] = useState(false)

  const venue = event?.venue
  const performers = event?.performers ?? []

  // Resolve performer names for the byline + lineup (real data).
  const lineup = useQuery({
    queryKey: ['event-lineup', id ?? null],
    enabled: !!event && performers.length > 0,
    queryFn: async (): Promise<LineupMember[]> => {
      const artistIds = performers.filter((p) => p.performer_type === 'artist').map((p) => p.performer_id)
      const bandIds = performers.filter((p) => p.performer_type === 'band').map((p) => p.performer_id)
      const [artists, bands] = await Promise.all([
        artistIds.length
          ? supabase.from('artists').select('id, stage_name').in('id', artistIds)
          : Promise.resolve({ data: [] as { id: string; stage_name: string }[] }),
        bandIds.length
          ? supabase.from('bands').select('id, name').in('id', bandIds)
          : Promise.resolve({ data: [] as { id: string; name: string }[] }),
      ])
      const out: LineupMember[] = []
      for (const a of (artists.data ?? []) as { id: string; stage_name: string }[])
        out.push({ id: a.id, type: 'artist', name: a.stage_name })
      for (const b of (bands.data ?? []) as { id: string; name: string }[])
        out.push({ id: b.id, type: 'band', name: b.name })
      return out
    },
  })

  // Active venue offer shown on the event page (mockup .offer).
  const offer = useQuery({
    queryKey: ['event-offer', venue?.id ?? null],
    enabled: !!venue?.id,
    queryFn: async () => {
      const { data, error: e } = await supabase
        .from('offers')
        .select('id, message')
        .eq('venue_id', venue!.id)
        .eq('active', true)
        .order('start_date', { ascending: true })
        .limit(1)
      if (e) throw e
      return ((data ?? []) as { id: string; message: string }[])[0] ?? null
    },
  })

  async function onGetTickets() {
    if (!event?.ticket_url || !id) return
    await billingQ.logTicketTap(supabase, id)
    Linking.openURL(billingQ.withTicketUtm(event.ticket_url, id))
  }

  function onDirections() {
    if (!venue) return
    const q = encodeURIComponent([venue.name, venue.address, venue.city, venue.region].filter(Boolean).join(' '))
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`)
  }

  async function onShare() {
    if (!event) return
    await Share.share({ message: `${event.title}${venue ? ` at ${venue.name}` : ''} — on Who's Playing` })
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !event) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <View className="flex-row items-center px-5 pt-1">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
          >
            <IconChevronLeft size={20} color="#071020" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          {error ? <IconWifiOff size={28} color="#9AA1AC" /> : <IconCalendar size={28} color="#9AA1AC" />}
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this event.' : 'This event isn’t available.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const isConfirmed = event.status === 'confirmed'
  const bylineNames = (lineup.data ?? []).map((m) => m.name).join(' · ')

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        {/* Hero */}
        <View className="h-80 justify-end overflow-hidden bg-night">
          {event.cover_image_url ? (
            <ImageBackground source={{ uri: event.cover_image_url }} className="absolute inset-0" resizeMode="cover" />
          ) : null}
          <Scrim />
          <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0">
            <View className="mt-2 flex-row items-center justify-between px-4">
              <Pressable
                onPress={() => router.back()}
                className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
              >
                <IconChevronLeft size={18} color="#071020" />
              </Pressable>
              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={onShare}
                  className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
                >
                  <IconShare size={17} color="#071020" />
                </Pressable>
                <Pressable
                  onPress={() => setSaved((s) => !s)}
                  className={`h-[38px] w-[38px] items-center justify-center rounded-full ${saved ? 'bg-coral' : 'bg-white/90'}`}
                >
                  {saved ? (
                    <IconHeartFilled size={17} color="#FFFFFF" />
                  ) : (
                    <IconHeart size={17} color="#FF5A5F" />
                  )}
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
          <View className="px-5 pb-5">
            <View className="mb-2 self-start rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[11px] font-extrabold uppercase tracking-wide text-white">
                {event.is_special ? 'Special event' : 'Live music'}
              </Text>
            </View>
            <Text className="text-[28px] font-black leading-tight text-white">{event.title}</Text>
            <Text className="mt-1 text-[14px] font-semibold text-white/90">
              {bylineNames ? `with ${bylineNames} · ` : ''}
              {timeLabel(event.starts_at)}
            </Text>
          </View>
        </View>

        <View className="px-5">
          {/* Confirmation badge */}
          <View
            className="mt-4 flex-row items-center gap-1.5 self-start rounded-full px-3.5 py-2"
            style={{ backgroundColor: isConfirmed ? '#E1F5EE' : '#FAEEDA' }}
          >
            {isConfirmed ? (
              <IconCircleCheck size={14} color="#0F6E56" />
            ) : (
              <IconClock size={14} color="#854F0B" />
            )}
            <Text className="text-[13px] font-extrabold" style={{ color: isConfirmed ? '#0F6E56' : '#854F0B' }}>
              {isConfirmed ? 'Confirmed · venue + artist' : 'Lineup confirming'}
            </Text>
          </View>

          {/* Info rows — map-pin → clock → ticket */}
          <View className="mt-4">
            {venue ? (
              <Pressable onPress={() => router.push(`/venue/${venue.id}`)}>
                <InfoRow
                  icon={IconMapPin}
                  title={venue.name}
                  sub={[venue.address, venue.city, venue.region].filter(Boolean).join(', ') || undefined}
                  chevron
                />
              </Pressable>
            ) : null}
            <InfoRow icon={IconClock} title={whenLabel(event.starts_at)} sub={`Show ${timeLabel(event.starts_at)}`} />
            <InfoRow icon={IconTicket} title="$15 advance" sub="21+ · tickets at the door" />
          </View>

          {/* CTAs — Save show (primary) + Directions (secondary) */}
          <View className="mt-5 flex-row gap-3">
            <View className="flex-[1.4]">
              <GradientButton
                label={saved ? 'Saved' : 'Save show'}
                icon={saved ? IconHeartFilled : IconHeart}
                onPress={() => setSaved((s) => !s)}
              />
            </View>
            {venue ? (
              <Pressable
                onPress={onDirections}
                className="flex-1 flex-row items-center justify-center gap-1.5 rounded-[14px] border border-ink-line bg-surface py-4"
              >
                <IconNavigation size={16} color="#111318" />
                <Text className="text-[15px] font-extrabold text-ink">Directions</Text>
              </Pressable>
            ) : null}
          </View>
          {event.ticket_url ? (
            <Pressable onPress={onGetTickets} className="mt-2.5 flex-row items-center justify-center gap-1.5 py-2">
              <IconTicket size={15} color="#FF5A5F" />
              <Text className="text-[13.5px] font-extrabold text-coral">Get tickets</Text>
            </Pressable>
          ) : null}

          {/* Venue offer */}
          {offer.data ? (
            <View
              className="mt-5 items-center rounded-2xl border-[1.5px] px-4 py-4"
              style={{ borderColor: '#F2D58A', backgroundColor: '#FFF7E6' }}
            >
              <View className="flex-row items-center gap-1.5">
                <IconDiscount size={12} color="#9A6A00" />
                <Text className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: '#9A6A00' }}>
                  Venue offer
                </Text>
              </View>
              <Text className="mt-2 text-center text-[15px] font-bold leading-snug" style={{ color: '#071020' }}>
                {offer.data.message}
              </Text>
              <Text className="mt-1.5 text-center text-[12.5px] font-semibold" style={{ color: '#8A6A2A' }}>
                Show this QR to your bartender or wait staff!
              </Text>
              {offerRevealed ? (
                <View className="mt-3 items-center">
                  <QrPlaceholder />
                </View>
              ) : (
                <Pressable
                  onPress={() => setOfferRevealed(true)}
                  className="mt-3 flex-row items-center gap-2 rounded-xl bg-ink-deep px-5 py-3"
                >
                  <IconQrcode size={15} color="#FFFFFF" />
                  <Text className="text-[13.5px] font-extrabold text-white">Reveal QR to redeem</Text>
                </Pressable>
              )}
              {venue ? (
                <Text className="mt-3 text-[11px] font-bold" style={{ color: '#B08A3A' }}>
                  From {venue.name} · valid tonight
                </Text>
              ) : null}
            </View>
          ) : null}

          {/* Lineup */}
          {(lineup.data ?? []).length > 0 ? (
            <>
              <Text className="mt-7 text-[18px] font-extrabold text-ink-deep">Lineup</Text>
              <View className="mt-3 flex-row items-center">
                {(lineup.data ?? []).slice(0, 5).map((m, i) => (
                  <Pressable
                    key={`${m.type}-${m.id}`}
                    onPress={() => router.push(m.type === 'artist' ? `/artist/${m.id}` : `/band/${m.id}`)}
                    className="h-[46px] w-[46px] items-center justify-center rounded-full border-[2.5px] border-canvas"
                    style={{ backgroundColor: AV_COLORS[i % AV_COLORS.length], marginLeft: i === 0 ? 0 : -12 }}
                  >
                    <Text className="text-[15px] font-extrabold text-white">{initials(m.name)}</Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => {
                    const first = (lineup.data ?? [])[0]
                    if (first) router.push(first.type === 'artist' ? `/artist/${first.id}` : `/band/${first.id}`)
                  }}
                  className="ml-3.5"
                >
                  <Text className="text-[13px] font-extrabold text-coral">View artists</Text>
                </Pressable>
              </View>
            </>
          ) : null}

          {/* About */}
          {event.description ? (
            <>
              <Text className="mt-7 text-[18px] font-extrabold text-ink-deep">About</Text>
              <Text className="mt-2.5 text-[14px] leading-6 text-ink-slate">{event.description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  )
}

function InfoRow({
  icon: Icon,
  title,
  sub,
  chevron,
}: {
  icon: TablerIcon
  title: string
  sub?: string
  chevron?: boolean
}) {
  return (
    <View className="flex-row items-center gap-3 border-b border-ink-line py-3">
      <View style={{ width: 24, alignItems: 'center' }}>
        <Icon size={20} color="#FF5A5F" />
      </View>
      <View className="flex-1">
        <Text className="text-[14.5px] font-bold text-ink">{title}</Text>
        {sub ? <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{sub}</Text> : null}
      </View>
      {chevron ? <IconChevronRight size={18} color="#9AA1AC" /> : null}
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
          const corner =
            (r < 3 && c < 3) || (r < 3 && c > cells - 4) || (r > cells - 4 && c < 3)
          const on = corner || (r + c) % 2 === 0 || (i * 7) % 5 === 0
          return (
            <View key={i} style={{ width: cell, height: cell, backgroundColor: on ? '#071020' : '#FFFFFF' }} />
          )
        })}
      </View>
    </View>
  )
}
