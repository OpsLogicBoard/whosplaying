import {
  IconBolt,
  IconBrandApple,
  IconBrandBandcamp,
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandStripe,
  IconBrandTiktok,
  IconBrandWindows,
  IconBrandX,
  IconBrandYoutube,
  IconBulb,
  IconCircleCheckFilled,
  IconLink,
  IconMailFast,
  IconPlugConnected,
  IconTemplate,
  IconTicket,
  IconWebhook,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Integrations directory (mockup intdir). Design surface — statuses are
// illustrative until the connection plumbing ships.
type Status = 'connected' | 'synced' | 'connect' | 'setup' | 'soon'
type Row = { icon: TablerIcon; color?: string; label: string; status: Status }

const SECTIONS: { title: string; rows: Row[] }[] = [
  {
    title: 'Identity & social',
    rows: [
      { icon: IconBrandInstagram, label: 'Instagram', status: 'connected' },
      { icon: IconBrandFacebook, color: '#1877F2', label: 'Facebook', status: 'connected' },
      { icon: IconBrandTiktok, label: 'TikTok', status: 'connect' },
      { icon: IconBrandX, label: 'X (Twitter)', status: 'connect' },
    ],
  },
  {
    title: 'Calendar',
    rows: [
      { icon: IconBrandGoogle, label: 'Google Calendar', status: 'synced' },
      { icon: IconBrandApple, label: 'Apple Calendar', status: 'connect' },
      { icon: IconBrandWindows, label: 'Outlook', status: 'connect' },
    ],
  },
  {
    title: 'Music',
    rows: [
      { icon: IconBrandSpotify, color: '#1DB954', label: 'Spotify', status: 'connected' },
      { icon: IconBrandApple, label: 'Apple Music', status: 'connect' },
      { icon: IconBrandBandcamp, label: 'Bandcamp', status: 'connect' },
      { icon: IconBrandSoundcloud, label: 'SoundCloud', status: 'connect' },
      { icon: IconBrandYoutube, color: '#FF0000', label: 'YouTube', status: 'connect' },
    ],
  },
  {
    title: 'Publishing',
    rows: [
      { icon: IconTemplate, label: 'Canva', status: 'connect' },
      { icon: IconLink, label: 'Linktree', status: 'connect' },
    ],
  },
  {
    title: 'Payments & ticketing',
    rows: [
      { icon: IconBrandStripe, label: 'Stripe', status: 'soon' },
      { icon: IconTicket, label: 'Eventbrite', status: 'soon' },
      { icon: IconTicket, label: 'DICE', status: 'soon' },
    ],
  },
  {
    title: 'Marketing & CRM',
    rows: [{ icon: IconMailFast, label: 'Mailchimp', status: 'soon' }],
  },
  {
    title: 'Developers',
    rows: [
      { icon: IconWebhook, label: 'Webhooks & API', status: 'setup' },
      { icon: IconBolt, label: 'Zapier', status: 'soon' },
    ],
  },
]

function StatusTag({ status }: { status: Status }) {
  if (status === 'connected' || status === 'synced') {
    return (
      <View className="flex-row items-center gap-1">
        <IconCircleCheckFilled size={14} color="#0F6E56" />
        <Text className="text-[11.5px] font-extrabold text-green">{status === 'synced' ? 'Synced' : 'Connected'}</Text>
      </View>
    )
  }
  if (status === 'connect') return <Text className="text-[12px] font-extrabold text-coral">Connect</Text>
  if (status === 'setup') return <Text className="text-[12px] font-extrabold text-coral">Set up</Text>
  return <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Coming soon</Text>
}

export default function IntegrationsScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Integrations" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-1 flex-row gap-2 px-1">
          <IconPlugConnected size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
            Connect the tools you already use. New integrations are added all the time — request one any time.
          </Text>
        </View>
        {SECTIONS.map((s) => (
          <View key={s.title}>
            <Text className="mb-1 mt-4 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              {s.title}
            </Text>
            {s.rows.map((r) => {
              const Icon = r.icon
              return (
                <View key={r.label} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
                  <View style={{ width: 24, alignItems: 'center' }}>
                    <Icon size={20} color={r.color ?? '#5C6470'} />
                  </View>
                  <Text className="flex-1 text-[14.5px] font-semibold text-ink">{r.label}</Text>
                  <StatusTag status={r.status} />
                </View>
              )
            })}
          </View>
        ))}
        <View className="mt-3 flex-row items-start gap-2 px-1">
          <IconBulb size={13} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-mute">
            Don't see your tool? The Webhooks &amp; API connection lets you wire up almost anything.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
