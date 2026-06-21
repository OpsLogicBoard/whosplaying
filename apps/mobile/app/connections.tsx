import {
  IconBrandApple,
  IconBrandBandcamp,
  IconBrandFacebook,
  IconBrandGoogle,
  IconBrandInstagram,
  IconBrandSpotify,
  IconBrandTiktok,
  IconBrandYoutube,
  IconChevronRight,
  IconCircleCheckFilled,
  IconMusic,
  IconPlugConnected,
  IconRefresh,
  IconSparkles,
  IconTemplate,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'

// Connections (mockup connmgr). Integration plumbing isn't built yet; this is
// the design surface — statuses are illustrative until OAuth is wired.
type Row = {
  icon: TablerIcon
  color?: string
  label: string
  status: 'connected' | 'synced' | 'connect'
}

type Section = { title: string; rows: Row[]; hint?: { icon: TablerIcon; text: string } }

const SECTIONS: Section[] = [
  {
    title: 'Connected profiles',
    rows: [
      { icon: IconBrandInstagram, label: 'Instagram', status: 'connected' },
      { icon: IconBrandFacebook, color: '#1877F2', label: 'Facebook', status: 'connected' },
      { icon: IconBrandTiktok, label: 'TikTok', status: 'connect' },
    ],
  },
  {
    title: 'Calendar sync',
    rows: [
      { icon: IconBrandGoogle, label: 'Google Calendar', status: 'synced' },
      { icon: IconBrandApple, label: 'Apple Calendar', status: 'connect' },
    ],
    hint: { icon: IconRefresh, text: 'Saved shows sync live to your calendar — no manual export.' },
  },
  {
    title: 'Music',
    rows: [
      { icon: IconBrandSpotify, color: '#1DB954', label: 'Spotify', status: 'connected' },
      { icon: IconBrandApple, label: 'Apple Music', status: 'connect' },
      { icon: IconBrandBandcamp, label: 'Bandcamp', status: 'connect' },
      { icon: IconBrandYoutube, color: '#FF0000', label: 'YouTube', status: 'connect' },
    ],
    hint: { icon: IconMusic, text: 'Shown as Listen links on your artist profile so fans can hear you.' },
  },
  {
    title: 'Publishing',
    rows: [
      { icon: IconTemplate, label: 'Canva', status: 'connect' },
      { icon: IconBrandInstagram, label: 'Instagram posting', status: 'connected' },
    ],
    hint: {
      icon: IconSparkles,
      text: 'Push a single gig or your whole month out as flyers — “Sat Jun 20 · The Tide @ Surfer the Bar · 9 PM”.',
    },
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
                  {r.status === 'connect' ? (
                    <Text className="text-[12px] font-extrabold text-coral">Connect</Text>
                  ) : (
                    <View className="flex-row items-center gap-1">
                      <IconCircleCheckFilled size={14} color="#0F6E56" />
                      <Text className="text-[11.5px] font-extrabold text-green">
                        {r.status === 'synced' ? 'Synced' : 'Connected'}
                      </Text>
                    </View>
                  )}
                </View>
              )
            })}
            {s.hint ? (
              <View className="mt-2 flex-row items-start gap-2 px-1">
                <s.hint.icon size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
                <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-mute">{s.hint.text}</Text>
              </View>
            ) : null}
          </View>
        ))}

        <Pressable onPress={() => router.push('/integrations')} className="mt-4 flex-row items-center gap-3 py-3.5">
          <View style={{ width: 24, alignItems: 'center' }}>
            <IconPlugConnected size={20} color="#FF5A5F" />
          </View>
          <Text className="flex-1 text-[14.5px] font-semibold text-ink">Browse all integrations</Text>
          <IconChevronRight size={18} color="#9AA1AC" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
