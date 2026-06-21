import {
  IconAnchor,
  IconBolt,
  IconCheck,
  IconChevronLeft,
  IconHeartHandshake,
  IconLock,
  IconRocket,
  IconSparkles,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GradientButton } from '../components/ui'

// Venue Pro pricing (mockup m-plan). Checkout (Stripe) is Phase B — the CTA
// surfaces that rather than pretending to charge. Copy is canonical from the
// approved monetization plan ($14.99 founding / $24.99 list).
const FEATURES: { title: string; body: string; free?: string }[] = [
  { title: 'Unlimited offers', body: 'Run as many redeemable deals as you like — Free includes 1.', free: 'Free: 1' },
  { title: 'Event boosts', body: 'Push a show to the top of Tonight & the map.', free: '$5 each' },
  { title: 'GPS push to nearby fans', body: 'Alert goers in range — capped so it never spams.' },
  { title: 'Full analytics', body: 'Views, ticket-link taps & follower growth.', free: 'Basic' },
  { title: 'Featured placement & staff seats', body: 'Stand out in discovery; add your whole team.' },
  { title: 'Publishing tools', body: 'Flyers to Canva & Instagram in a tap.' },
]

export default function PlanScreen() {
  const router = useRouter()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      {/* Two-line header (mockup .pmtop): "Plan for" eyebrow over the venue name. */}
      <View className="flex-row items-center gap-3 px-5 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
        >
          <IconChevronLeft size={20} color="#071020" />
        </Pressable>
        <View className="flex-1">
          <Text className="text-[11px] font-extrabold uppercase tracking-wide text-ink-mute">Plan for</Text>
          <Text className="text-[16px] font-extrabold tracking-tight text-ink-deep">Surfer the Bar</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="items-center">
          <View className="mb-3 flex-row items-center gap-1.5 rounded-full bg-coral-soft px-3 py-1.5">
            <IconBolt size={12} color="#FF5A5F" />
            <Text className="text-[11px] font-extrabold uppercase tracking-wide text-coral">Venue Pro</Text>
          </View>
          <Text className="text-[29px] font-black tracking-tight text-ink-deep">Fill the room.</Text>
          <Text className="mt-1.5 text-center text-[14px] font-semibold leading-5 text-ink-slate">
            Everything in Free, plus the tools to reach more fans on the nights it matters.
          </Text>
          <View className="mt-4 flex-row items-baseline gap-2">
            <Text className="text-[46px] font-black tracking-tight text-ink-deep">$14.99</Text>
            <Text className="text-[17px] font-bold text-ink-mute line-through">$24.99</Text>
            <Text className="text-[14px] font-bold text-ink-slate">/mo</Text>
          </View>
        </View>

        <View className="mb-3.5 mt-1 flex-row items-center justify-center gap-1.5 rounded-xl bg-green-soft px-3 py-2.5">
          <IconAnchor size={13} color="#0F6E56" />
          <Text className="text-[12px] font-bold text-green">Founding rate — locked for life for the first Beaches venues</Text>
        </View>

        <View className="mb-3.5 rounded-[18px] border border-ink-line bg-surface px-4 shadow-card">
          {FEATURES.map((f, i) => (
            <View
              key={f.title}
              className={`flex-row items-start gap-3 py-3 ${i < FEATURES.length - 1 ? 'border-b border-ink-line' : ''}`}
            >
              <View className="mt-0.5 h-[22px] w-[22px] items-center justify-center rounded-full bg-green-soft">
                <IconCheck size={13} color="#0F6E56" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-ink">{f.title}</Text>
                <Text className="mt-0.5 text-[12px] font-semibold leading-4 text-ink-slate">{f.body}</Text>
              </View>
              {f.free ? (
                <Text className="pt-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">{f.free}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View className="mb-3.5 flex-row items-center gap-3 rounded-[15px] border-[1.5px] px-3.5 py-3.5" style={{ borderColor: '#F2D58A', backgroundColor: '#FFFBF0' }}>
          <View className="h-[38px] w-[38px] items-center justify-center rounded-xl bg-surface">
            <IconRocket size={19} color="#FFB020" />
          </View>
          <View className="flex-1">
            <Text className="text-[13.5px] font-extrabold" style={{ color: '#7a5a12' }}>Just need one big night?</Text>
            <Text className="mt-0.5 text-[11.5px] font-semibold" style={{ color: '#9A6A00' }}>Boost a single event for $5 — no subscription.</Text>
          </View>
        </View>

        <View className="mb-4 flex-row gap-2.5 px-1">
          <IconHeartHandshake size={15} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            Free forever for fans and artists. <Text className="font-extrabold">Get Tickets</Text> links are always free.
            We only charge venues — enough to keep the lights on and support local music.
          </Text>
        </View>

        <GradientButton
          label="Start Venue Pro · $14.99/mo"
          icon={IconSparkles}
          onPress={() => Alert.alert('Checkout', 'Stripe Checkout (Founding $14.99/mo) — wiring in progress.')}
        />
        <Text onPress={() => router.back()} className="py-3 text-center text-[13.5px] font-bold text-ink-slate">
          Maybe later
        </Text>
        <View className="flex-row items-center justify-center gap-1.5">
          <IconLock size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">Secure checkout · cancel anytime · multi-venue +$12 each</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
