import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const days = [
  { d: 'Sat', n: '14', on: true },
  { d: 'Sun', n: '15' },
  { d: 'Mon', n: '16' },
  { d: 'Tue', n: '17' },
  { d: 'Wed', n: '18' },
  { d: 'Thu', n: '19' },
]

const shows = [
  { id: 'sunset', title: 'Sunset Sessions', venue: 'Surfer the Bar · Acoustic', time: '7:00', color: '#FFB020' },
  { id: 'saltwater', title: 'The Saltwater Revival', venue: "Lonnie's Western Room · Country", time: '8:30', color: '#B7F34A' },
  { id: 'brass', title: 'Beaches Brass Band', venue: 'Blue Jay Listening Room · Funk', time: '9:30', color: '#FF3F73' },
  { id: 'coastline', title: 'Coastline', venue: 'Ocean Street Taproom · Indie', time: '10:30', color: '#2D7FF9' },
]

export default function ExploreScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5 pr-4"
        >
          {days.map((day) => (
            <Pressable
              key={day.n}
              className={`w-[52px] items-center rounded-xl py-2.5 ${day.on ? 'bg-coral' : ''}`}
            >
              <Text className={`text-[11px] font-bold uppercase ${day.on ? 'text-white' : 'text-ink-mute'}`}>
                {day.d}
              </Text>
              <Text className={`mt-0.5 text-[18px] font-extrabold ${day.on ? 'text-white' : 'text-ink'}`}>
                {day.n}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mt-4 h-12 flex-row items-center rounded-2xl border border-ink-line bg-surface px-4">
          <Feather name="search" size={18} color="#9AA1AC" />
          <TextInput
            className="ml-2 flex-1 text-[15px] text-ink"
            placeholder="Search events, artists, venues"
            placeholderTextColor="#9AA1AC"
            returnKeyType="search"
          />
        </View>

        <Text className="mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
          Saturday, June 14
        </Text>

        <View className="mt-3">
          {shows.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => router.push(`/event/${e.id}`)}
              className="mb-4 flex-row items-center gap-3"
            >
              <View className="h-16 w-16 rounded-2xl" style={{ backgroundColor: e.color }} />
              <View className="flex-1">
                <Text className="text-[15.5px] font-semibold text-ink" numberOfLines={1}>
                  {e.title}
                </Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                  {e.venue}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[14px] font-extrabold text-ink-deep">{e.time}</Text>
                <Text className="text-[11px] font-bold text-ink-mute">PM</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
