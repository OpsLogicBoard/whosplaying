import { IconBell, IconCalendar, IconHome, IconWifiOff } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHostedEvents } from '@whosplaying/core'
import { StatusBadge, type StatusKind } from '../../components/ui'
import { useAuth } from '../../lib/auth'

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short' })
}

function dayNum(iso: string): string {
  return new Date(iso).getDate().toString()
}

function whenLabel(iso: string): string {
  const d = new Date(iso)
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' })
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${wd} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Date-badge tint mirrors the prototype: each status colour-codes the badge.
const BADGE_TINT: Record<StatusKind, { bg: string; fg: string }> = {
  confirmed: { bg: '#E1F5EE', fg: '#0F6E56' },
  wait: { bg: '#FAEEDA', fg: '#854F0B' },
  open: { bg: '#E6F1FB', fg: '#185FA5' },
  muted: { bg: '#EEF0F4', fg: '#5C6470' },
}

function DateBadge({ iso, kind }: { iso: string; kind: StatusKind }) {
  const t = BADGE_TINT[kind]
  return (
    <View
      style={{ backgroundColor: t.bg }}
      className="h-[52px] w-[52px] items-center justify-center rounded-2xl"
    >
      <Text style={{ color: t.fg }} className="text-[11px] font-extrabold uppercase">
        {monthLabel(iso)}
      </Text>
      <Text style={{ color: t.fg }} className="text-[19px] font-extrabold leading-5">
        {dayNum(iso)}
      </Text>
    </View>
  )
}

export default function BookingsScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { events, ownsVenue, isLoading, error, refetch, isRefetching } = useHostedEvents(
    session?.user?.id,
  )

  const venueName = events[0]?.venue?.name ?? 'Your venue'

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      {/* Header: "Managing" eyebrow over the venue name, bell top-right */}
      <View className="flex-row items-center justify-between px-5 pt-2.5">
        <View>
          <Text className="text-[11px] font-extrabold uppercase tracking-wide text-ink-mute">
            Managing
          </Text>
          <Text className="text-[18px] font-extrabold text-ink-deep" numberOfLines={1}>
            {venueName}
          </Text>
        </View>
        <Pressable className="h-[38px] w-[38px] items-center justify-center rounded-full border border-ink-line bg-surface">
          <IconBell size={18} color="#071020" strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5A5F" />
        }
      >
        <Text className="mb-3.5 mt-1.5 text-[26px] font-extrabold text-ink-deep">Your gigs</Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-12 items-center px-6">
            <IconWifiOff size={28} color="#9AA1AC" strokeWidth={2} />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load your shows. Pull to retry.
            </Text>
          </View>
        ) : !ownsVenue ? (
          <View className="mt-12 items-center px-6">
            <IconHome size={28} color="#9AA1AC" strokeWidth={2} />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue to post shows and manage bookings.
            </Text>
          </View>
        ) : (
          <View>
            {events.map((e) => {
              // Map event status → prototype's four states.
              const kind: StatusKind =
                e.status === 'confirmed' ? 'confirmed' : 'wait'
              const label =
                e.status === 'confirmed' ? 'Confirmed' : 'Awaiting artist'
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3"
                >
                  <DateBadge iso={e.starts_at} kind={kind} />
                  <View className="flex-1">
                    <Text className="text-[15px] font-extrabold text-ink-deep" numberOfLines={1}>
                      {e.title}
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                      {whenLabel(e.starts_at)}
                    </Text>
                  </View>
                  <StatusBadge kind={kind} label={label} />
                </Pressable>
              )
            })}

            {/* Open slot row routes to the gig-board (mockup parity). */}
            <Pressable
              onPress={() => router.push('/gig-board')}
              className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3"
            >
              <View className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#E6F1FB]">
                <Text className="text-[11px] font-extrabold uppercase text-[#185FA5]">Open</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-ink-deep">Open slot</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                  Post a slot · take bids
                </Text>
              </View>
              <StatusBadge kind="open" label="Open" />
            </Pressable>

            {events.length === 0 ? (
              <View className="mt-8 items-center px-6">
                <IconCalendar size={28} color="#9AA1AC" strokeWidth={2} />
                <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">
                  No upcoming shows
                </Text>
                <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
                  Post an event to start booking performers.
                </Text>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
