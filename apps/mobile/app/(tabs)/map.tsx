import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvents } from '@whosplaying/core'

// v2 Map placeholder. MapLibre (react-native-maplibre) wires here with the
// brand map-style.json + coral Live-Pin markers (showtime in the pin centre).
// Until then the screen shows a real "tonight" event in the bottom sheet.

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function MapScreen() {
  const router = useRouter()
  const { from, to } = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setHours(23, 59, 59, 999)
    return { from: start, to: end }
  }, [])
  const { data: events } = useEvents({ from, to, status: 'confirmed' })
  const featured = events[0]

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-1 px-5 pt-3">
        <View className="h-12 flex-row items-center rounded-2xl border border-ink-line bg-surface px-4">
          <Feather name="search" size={18} color="#9AA1AC" />
          <Text className="ml-2 flex-1 text-[15px] font-semibold text-ink-mute">Search this area</Text>
          <Feather name="sliders" size={18} color="#111318" />
        </View>

        <View className="mt-4 flex-1 items-center justify-center rounded-xl border border-ink-line bg-[#EAF1F4]">
          <Feather name="map-pin" size={30} color="#FF5A5F" />
          <Text className="mt-2 text-[13px] font-semibold text-ink-slate">
            Interactive map · coral pins, showtimes
          </Text>
          {events.length > 0 ? (
            <Text className="mt-0.5 text-[12px] font-semibold text-ink-mute">
              {events.length} show{events.length === 1 ? '' : 's'} tonight
            </Text>
          ) : null}
        </View>

        {featured ? (
          <Pressable
            onPress={() => router.push(`/event/${featured.id}`)}
            className="absolute inset-x-5 bottom-4 flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-3 shadow-card"
          >
            <View className="rounded-lg bg-coral" style={{ height: 52, width: 52 }} />
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                {featured.title}
              </Text>
              <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                {featured.venue?.name ?? 'TBA'} · tonight {timeLabel(featured.starts_at)}
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-coral">
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </View>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  )
}
