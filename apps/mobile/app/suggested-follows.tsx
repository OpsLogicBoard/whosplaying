import { IconBell, IconBrandInstagram } from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, Toggle } from '../components/ui'

// Suggested follows / social match (mockup suggest). The Instagram/Facebook
// match isn't wired yet, so this shows the design with sample suggestions and
// local follow toggles until the import backend ships.
const SUGGESTIONS = [
  { initials: 'FT', color: '#23272F', name: 'The Firewater Tent Revival', sub: 'Artist · you follow on Instagram' },
  { initials: 'SB', color: '#0F6E56', name: 'Surfer the Bar', sub: 'Venue · you follow on Instagram' },
  { initials: 'CK', color: '#8B5CF6', name: 'Chloe Kimes', sub: 'Artist · 3 friends follow' },
  { initials: 'BJ', color: '#2D7FF9', name: 'Blue Jay Listening Room', sub: 'Venue · you follow on Facebook' },
  { initials: 'LT', color: '#FFB020', name: 'Low Tide Social Club', sub: 'Artist · you follow on Instagram' },
  { initials: 'BB', color: '#FF3F73', name: 'Beaches Brass Band', sub: 'Artist · 5 friends follow' },
]

export default function SuggestedFollowsScreen() {
  const router = useRouter()
  const [notify, setNotify] = useState(true)
  const [followed, setFollowed] = useState<Record<string, boolean>>({})

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="People you follow" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-3 flex-row gap-2 px-1">
          <IconBrandInstagram size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
            Matched from your Instagram &amp; Facebook. Follow them to get alerts when they play.
          </Text>
        </View>

        <View className="mb-2 flex-row items-center justify-between rounded-2xl border border-ink-line bg-surface px-4 py-3">
          <View className="flex-row items-center gap-2">
            <IconBell size={16} color="#FF5A5F" />
            <Text className="text-[14px] font-semibold text-ink">Tell me when people I follow join</Text>
          </View>
          <Toggle on={notify} onToggle={() => setNotify((v) => !v)} />
        </View>

        <Text className="mb-1 mt-3 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Suggested for you</Text>
        {SUGGESTIONS.map((s) => {
          const on = followed[s.name]
          return (
            <View key={s.name} className="flex-row items-center gap-3 border-b border-ink-line py-3">
              <View className="h-[46px] w-[46px] items-center justify-center rounded-full" style={{ backgroundColor: s.color }}>
                <Text className="text-[15px] font-extrabold text-white">{s.initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">{s.name}</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{s.sub}</Text>
              </View>
              <Pressable
                onPress={() => setFollowed((f) => ({ ...f, [s.name]: !f[s.name] }))}
                className={`rounded-full px-4 py-2 ${on ? 'bg-[#EEF0F4]' : 'bg-coral'}`}
              >
                <Text className={`text-[12.5px] font-extrabold ${on ? 'text-ink-slate' : 'text-white'}`}>
                  {on ? 'Following' : 'Follow'}
                </Text>
              </Pressable>
            </View>
          )
        })}

        <Pressable
          onPress={() => setFollowed(Object.fromEntries(SUGGESTIONS.map((s) => [s.name, true])))}
          className="mt-4 items-center rounded-[15px] border border-ink-line bg-surface py-3.5"
        >
          <Text className="text-[15px] font-extrabold text-ink">Follow all</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
