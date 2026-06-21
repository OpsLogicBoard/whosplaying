import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Integrations directory (mockup intdir). Design surface — statuses are
// illustrative until the connection plumbing ships.
type Status = 'connected' | 'connect' | 'soon'
type Row = { icon: keyof typeof Feather.glyphMap; label: string; status: Status }

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Identity & social',
    rows: [
      { icon: 'instagram', label: 'Instagram', status: 'connected' },
      { icon: 'facebook', label: 'Facebook', status: 'connected' },
      { icon: 'music', label: 'TikTok', status: 'connect' },
      { icon: 'twitter', label: 'X (Twitter)', status: 'connect' },
    ],
  },
  {
    title: 'Calendar',
    rows: [
      { icon: 'calendar', label: 'Google Calendar', status: 'connected' },
      { icon: 'calendar', label: 'Apple Calendar', status: 'connect' },
      { icon: 'calendar', label: 'Outlook', status: 'connect' },
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
  {
    title: 'Payments & ticketing',
    rows: [
      { icon: 'credit-card', label: 'Stripe', status: 'soon' },
      { icon: 'tag', label: 'Eventbrite', status: 'soon' },
      { icon: 'tag', label: 'DICE', status: 'soon' },
    ],
  },
  {
    title: 'Developers',
    rows: [
      { icon: 'code', label: 'Webhooks & API', status: 'connect' },
      { icon: 'zap', label: 'Zapier', status: 'soon' },
    ],
  },
]

export default function IntegrationsScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Integrations" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-1 flex-row gap-2 px-1">
          <Feather name="link" size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
            Connect the tools you already use. New integrations are added all the time — request one any time.
          </Text>
        </View>
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
                ) : r.status === 'connect' ? (
                  <Text className="text-[12px] font-extrabold text-coral">Connect</Text>
                ) : (
                  <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Coming soon</Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
