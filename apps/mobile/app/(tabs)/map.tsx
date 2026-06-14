import { Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

// v2 Map placeholder. MapLibre (react-native-maplibre) wires here with the
// brand map-style.json + coral Live-Pin markers (showtime in the pin centre).
const sheet = {
  id: 'firewater',
  title: 'The Firewater Tent Revival',
  venue: 'Surfer the Bar',
  time: '8:00 PM',
  color: '#FF5A5F',
}

export default function MapScreen() {
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
          <Text className="mt-2 text-[13px] font-semibold text-ink-slate">Interactive map · coral pins, showtimes</Text>
        </View>

        <View className="absolute inset-x-5 bottom-4 flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-3 shadow-card">
          <View className="rounded-lg" style={{ backgroundColor: sheet.color, height: 52, width: 52 }} />
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
              {sheet.title}
            </Text>
            <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
              {sheet.venue} · tonight {sheet.time}
            </Text>
          </View>
          <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-coral">
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
