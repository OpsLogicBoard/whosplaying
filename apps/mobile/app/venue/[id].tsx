import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useVenue, useEvents } from '@whosplaying/core'

// Accent palette for upcoming-show thumbnails (cycled by index).
const THUMBS = ['#2D7FF9', '#FFB020', '#1D9E75', '#8B5CF6', '#FF5A5F']

function whenLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function timeLabel(iso: string): { time: string; ampm: string } {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return { time: `${h}:${m.toString().padStart(2, '0')}`, ampm }
}

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: venue, isLoading, error } = useVenue(id)
  const from = useMemo(() => new Date(), [])
  const { data: events, isLoading: eventsLoading } = useEvents({
    venueId: id,
    from,
    status: 'confirmed',
  })

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !venue) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name={error ? 'wifi-off' : 'map-pin'} size={28} color="#9AA1AC" />
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this venue.' : 'Venue not found.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Header onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-2 h-56 justify-end overflow-hidden rounded-2xl bg-night p-4">
          {venue.is_verified ? (
            <View className="flex-row items-center gap-1.5">
              <Feather name="check-circle" size={13} color="#1D9E75" />
              <Text className="text-[11px] font-extrabold tracking-wide text-white">VERIFIED</Text>
            </View>
          ) : null}
          <Text className="mt-1 text-[26px] font-extrabold leading-tight text-white">
            {venue.name}
          </Text>
          <Text className="mt-0.5 text-[13px] font-semibold text-white/90">
            {[venue.city, venue.region].filter(Boolean).join(', ')}
          </Text>
        </View>

        {venue.description ? (
          <Text className="mt-6 text-[15px] leading-6 text-ink-slate">{venue.description}</Text>
        ) : null}

        <Text className="mt-7 text-[18px] font-extrabold text-ink-deep">Upcoming shows</Text>

        {eventsLoading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : events.length === 0 ? (
          <View className="mt-8 items-center px-6">
            <Feather name="calendar" size={26} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              No upcoming shows.
            </Text>
          </View>
        ) : (
          <View className="mt-4">
            {events.map((e, i) => {
              const t = timeLabel(e.starts_at)
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="mb-4 flex-row items-center gap-3"
                >
                  <View
                    className="h-16 w-16 rounded-2xl"
                    style={{ backgroundColor: THUMBS[i % THUMBS.length] }}
                  />
                  <View className="flex-1">
                    <Text className="text-[15.5px] font-semibold text-ink" numberOfLines={1}>
                      {e.title}
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                      {whenLabel(e.starts_at)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[14px] font-extrabold text-ink-deep">{t.time}</Text>
                    <Text className="text-[11px] font-bold text-ink-mute">{t.ampm}</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center px-5 pt-1">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
      >
        <Feather name="chevron-left" size={20} color="#071020" />
      </Pressable>
    </View>
  )
}
