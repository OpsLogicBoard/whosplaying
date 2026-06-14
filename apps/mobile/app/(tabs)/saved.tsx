import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const following = [
  { id: 'firewater', initials: 'FT', name: 'The Firewater Tent Revival', sub: 'Artist · roots rock', color: '#23272F' },
  { id: 'chloe', initials: 'CK', name: 'Chloe Kimes & The Tide', sub: 'Artist · indie', color: '#2D7FF9' },
  { id: 'lowtide', initials: 'LT', name: 'Low Tide Social Club', sub: 'Artist · funk', color: '#FFB020' },
  { id: 'surfer', initials: 'SB', name: 'Surfer the Bar', sub: 'Venue · Jacksonville Beach', color: '#1D9E75' },
  { id: 'bluejay', initials: 'BJ', name: 'Blue Jay Listening Room', sub: 'Venue · Jacksonville Beach', color: '#8B5CF6' },
]

const savedShows = [
  { id: 'firewater', mon: 'Jun', day: '13', title: 'The Firewater Tent Revival', sub: 'Surfer the Bar · tonight 8:00 PM', alert: true },
  { id: 'chloe', mon: 'Jun', day: '14', title: 'Chloe Kimes & The Tide', sub: 'Blue Jay Listening Room · 8:30 PM', alert: true },
  { id: 'saltwater', mon: 'Jun', day: '21', title: 'The Saltwater Revival', sub: "Lonnie's Western Room · 10:00 PM", alert: false },
]

export default function SavedScreen() {
  const router = useRouter()
  const [view, setView] = useState<'following' | 'shows'>('following')
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-3">
        <View className="flex-row rounded-xl bg-[#EEF0F4] p-1">
          {(['following', 'shows'] as const).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              className={`flex-1 items-center rounded-lg py-2 ${view === v ? 'bg-surface' : ''}`}
            >
              <Text className={`text-[13px] font-bold ${view === v ? 'text-ink' : 'text-ink-slate'}`}>
                {v === 'following' ? 'Following' : 'Shows'}
              </Text>
            </Pressable>
          ))}
        </View>

        {view === 'following' ? (
          <View className="mt-2">
            {following.map((f) => (
              <Pressable key={f.id} className="flex-row items-center gap-3 border-b border-ink-line py-3">
                <View className="h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: f.color }}>
                  <Text className="text-[15px] font-extrabold text-white">{f.initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                    {f.name}
                  </Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{f.sub}</Text>
                </View>
                <Feather name="heart" size={20} color="#FF5A5F" />
              </Pressable>
            ))}
          </View>
        ) : (
          <View className="mt-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[18px] font-extrabold text-ink-deep">Upcoming</Text>
              <Text className="text-[13px] font-bold text-coral">Alerts on</Text>
            </View>
            {savedShows.map((s) => (
              <Pressable
                key={s.id + s.day}
                onPress={() => router.push(`/event/${s.id}`)}
                className="mb-3 flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-3"
              >
                <View className="h-14 w-[52px] items-center justify-center rounded-md bg-coral-soft">
                  <Text className="text-[10.5px] font-extrabold uppercase text-coral">{s.mon}</Text>
                  <Text className="text-[21px] font-extrabold leading-none text-coral">{s.day}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                    {s.title}
                  </Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{s.sub}</Text>
                </View>
                <View
                  className={`h-9 w-9 items-center justify-center rounded-full ${s.alert ? 'bg-coral-soft' : 'bg-[#EEF0F4]'}`}
                >
                  <Feather name={s.alert ? 'bell' : 'bell-off'} size={16} color={s.alert ? '#FF5A5F' : '#9AA1AC'} />
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
