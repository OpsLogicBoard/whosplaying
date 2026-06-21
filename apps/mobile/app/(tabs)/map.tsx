import { IconSearch, IconAdjustmentsHorizontal, IconArrowRight, IconMapPin } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path, Circle } from 'react-native-svg'
import { useEvents, type EventWithRelations } from '@whosplaying/core'

/**
 * Live-Pin teardrop marker — pin silhouette + white circle + colored play
 * triangle, matching the prototype SVG. `color` fills both the silhouette and
 * the play glyph.
 */
function LivePin({ color, width = 40, height = 44 }: { color: string; width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 250 270">
      <Path
        d="M126 18 C178 18 219 59 219 111 C219 173 154 233 126 258 C98 233 33 173 33 111 C33 59 74 18 126 18Z"
        fill={color}
      />
      <Circle cx={126} cy={111} r={60} fill="#fff" />
      <Path
        d="M112 80 C112 75 118 72 122 75 L156 101 C162 105 162 114 156 118 L122 144 C118 147 112 144 112 139Z"
        fill={color}
      />
    </Svg>
  )
}

// v2 Map. The real interactive map (MapLibre + brand map-style.json + coral
// Live-Pin markers) needs an EAS dev build — it isn't Expo Go compatible — so
// this renders the prototype's decorative ground with pins for tonight's real
// shows (showtime in the bubble) and the bottom sheet, until that lands.

function timeShort(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')}`
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Decorative pin anchor positions (mockup layout), reused until real geo lands.
const PIN_SPOTS = [
  { left: '30%', top: '34%', color: '#FF5A5F' },
  { left: '64%', top: '52%', color: '#2D7FF9' },
  { left: '46%', top: '70%', color: '#8B5CF6' },
] as const

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
  const pins = events.slice(0, PIN_SPOTS.length)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected: EventWithRelations | undefined =
    pins.find((e) => e.id === selectedId) ?? pins[0]

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-1">
        {/* Decorative map ground (approximates mockup .mapbg radial zones) */}
        <View className="absolute inset-0 bg-[#E6EEF2]">
          <View className="absolute h-44 w-44 rounded-full bg-[#E8F7F2]" style={{ left: '12%', top: '14%' }} />
          <View className="absolute h-56 w-56 rounded-full bg-[#FFF3DE]" style={{ left: '54%', top: '50%' }} />
          <View className="absolute h-2 w-full bg-white/70" style={{ top: '40%' }} />
          <View className="absolute h-full w-2 bg-white/70" style={{ left: '52%' }} />
        </View>

        {/* Floating top search + filter */}
        <View className="flex-row gap-2.5 px-4 pt-2">
          <View className="h-11 flex-1 flex-row items-center gap-2 rounded-[13px] bg-white/95 px-4 shadow-card">
            <IconSearch size={17} color="#9AA1AC" strokeWidth={2} />
            <Text className="flex-1 text-[13.5px] font-semibold text-ink-slate">Search this area</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-[13px] bg-white/95 shadow-card">
            <IconAdjustmentsHorizontal size={18} color="#111318" strokeWidth={2} />
          </View>
        </View>

        {/* Pins for tonight's shows */}
        {pins.map((e, i) => {
          const spot = PIN_SPOTS[i]!
          const active = selected?.id === e.id
          return (
            <Pressable
              key={e.id}
              onPress={() => setSelectedId(e.id)}
              className="absolute items-center"
              style={{ left: spot.left as `${number}%`, top: spot.top as `${number}%`, transform: [{ translateX: -22 }, { translateY: -44 }] }}
            >
              <View className="mb-[-3px] rounded-md bg-ink-deep px-1.5 py-0.5">
                <Text className="text-[10px] font-extrabold text-white">{timeShort(e.starts_at)}</Text>
              </View>
              <View style={{ opacity: active ? 1 : 0.92 }}>
                <LivePin color={spot.color} width={active ? 44 : 38} height={active ? 48 : 42} />
              </View>
            </Pressable>
          )
        })}

        {/* Bottom sheet (mockup .mapsheet) */}
        {selected ? (
          <Pressable
            onPress={() => router.push(`/event/${selected.id}`)}
            className="absolute inset-x-3.5 bottom-4 flex-row items-center gap-3 rounded-[20px] bg-surface p-3.5 shadow-lift"
          >
            <View className="rounded-[13px] bg-coral" style={{ height: 54, width: 54 }} />
            <View className="flex-1">
              <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                {selected.title}
              </Text>
              <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                {selected.venue?.name ?? 'TBA'} · tonight {timeLabel(selected.starts_at)}
              </Text>
            </View>
            <View className="h-9 w-9 items-center justify-center rounded-full bg-coral">
              <IconArrowRight size={16} color="#FFFFFF" strokeWidth={2} />
            </View>
          </Pressable>
        ) : (
          <View className="absolute inset-x-3.5 bottom-4 items-center rounded-[20px] bg-surface p-5 shadow-lift">
            <IconMapPin size={24} color="#FF5A5F" strokeWidth={2} />
            <Text className="mt-2 text-[13px] font-semibold text-ink-slate">No shows on the map tonight</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
