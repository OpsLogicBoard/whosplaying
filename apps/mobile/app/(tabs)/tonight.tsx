import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const featured = {
  id: 'firewater',
  genre: 'Rock',
  title: 'The Firewater Tent Revival',
  venue: 'Surfer the Bar',
  dist: '0.4 mi',
}

const alsoTonight = [
  { id: 'chloe', title: 'Chloe Kimes & The Tide', venue: 'Blue Jay Listening Room', time: '8:30', color: '#2D7FF9' },
  { id: 'lowtide', title: 'Low Tide Social Club', venue: 'Ocean Street Taproom', time: '9:15', color: '#FFB020' },
  { id: 'saltwater', title: 'The Saltwater Revival', venue: "Lonnie's Western Room", time: '10:00', color: '#1D9E75' },
]

export default function TonightScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="flex-row items-center justify-between pt-1">
          <Pressable className="flex-row items-center gap-1 py-1">
            <Text className="text-[17px] font-extrabold text-ink-deep">Jacksonville Beach</Text>
            <Feather name="chevron-down" size={18} color="#5C6470" />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface">
            <Feather name="bell" size={19} color="#071020" />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral" />
          </Pressable>
        </View>

        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Playing <Text className="text-coral">tonight.</Text>
        </Text>

        <View className="mt-4 h-12 flex-row items-center rounded-2xl border border-ink-line bg-surface px-4">
          <Feather name="search" size={18} color="#9AA1AC" />
          <TextInput
            className="ml-2 flex-1 text-[15px] text-ink"
            placeholder="Search events, artists, venues"
            placeholderTextColor="#9AA1AC"
            returnKeyType="search"
          />
        </View>

        <Pressable
          onPress={() => router.push(`/event/${featured.id}`)}
          className="mt-5 h-52 justify-end overflow-hidden rounded-xl bg-night p-4"
        >
          <View className="absolute left-4 top-4 self-start rounded-full bg-white/20 px-3 py-1">
            <Text className="text-[11px] font-extrabold text-white">{featured.genre}</Text>
          </View>
          <View className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <Feather name="heart" size={16} color="#FF5A5F" />
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full bg-white" />
            <Text className="text-[11px] font-extrabold tracking-wide text-white">LIVE NOW</Text>
          </View>
          <Text className="mt-1 text-[22px] font-extrabold leading-tight text-white">{featured.title}</Text>
          <Text className="mt-0.5 text-[13px] font-semibold text-white/90">
            {featured.venue} · {featured.dist}
          </Text>
        </Pressable>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-[18px] font-extrabold text-ink-deep">Also tonight</Text>
          <Text className="text-[13px] font-bold text-coral">See all</Text>
        </View>

        <View className="mt-3">
          {alsoTonight.map((e) => (
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
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{e.venue}</Text>
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
