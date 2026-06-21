import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Connections (mockup connmgr). Integration plumbing isn't built yet; this is
// the design surface — statuses are illustrative until OAuth is wired.
type Row = { icon: keyof typeof Feather.glyphMap; label: string; status: 'connected' | 'connect' }

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Connected profiles',
    rows: [
      { icon: 'instagram', label: 'Instagram', status: 'connected' },
      { icon: 'facebook', label: 'Facebook', status: 'connected' },
      { icon: 'music', label: 'TikTok', status: 'connect' },
    ],
  },
  {
    title: 'Calendar sync',
    rows: [
      { icon: 'calendar', label: 'Google Calendar', status: 'connected' },
      { icon: 'calendar', label: 'Apple Calendar', status: 'connect' },
    ],
  },
  {
    title: 'Music',
    rows: [
      { icon: 'music', label: 'Spotify', status: 'connected' },
      { icon: 'music', label: 'Apple Music', status: 'connect' },
      { icon: 'youtube', label: 'YouTube', status: 'connect' },
    ],
  },
]

export default function ConnectionsScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Connections" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {SECTIONS.map((s) => (
          <View key={s.title}>
            <Text className="mb-1 mt-4 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">{s.title}</Text>
            {s.rows.map((r) => (
              <View key={r.label} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
                <Feather name={r.icon} size={19} color="#5C6470" style={{ width: 24, textAlign: 'center' }} />
                <Text className="flex-1 text-[14.5px] font-semibold text-ink">{r.label}</Text>
                {r.status === 'connected' ? (
                  <View className="flex-row items-center gap-1">
                    <Feather name="check-circle" size={13} color="#0F6E56" />
                    <Text className="text-[11.5px] font-extrabold text-teal">Connected</Text>
                  </View>
                ) : (
                  <Text className="text-[12px] font-extrabold text-coral">Connect</Text>
                )}
              </View>
            ))}
          </View>
        ))}

        <Pressable
          onPress={() => router.push('/integrations')}
          className="mt-2 flex-row items-center gap-3 py-3.5"
        >
          <Feather name="link" size={19} color="#FF5A5F" style={{ width: 24, textAlign: 'center' }} />
          <Text className="flex-1 text-[14.5px] font-semibold text-ink">Browse all integrations</Text>
          <Feather name="chevron-right" size={18} color="#9AA1AC" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
