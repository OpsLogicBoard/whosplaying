import {
  IconDiscount2,
  IconEyeCheck,
  IconInfoCircle,
  IconRocket,
  IconTrendingUp,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton } from '../components/ui'

// Boost composer (mockup m-boost). Reach figures are estimates; scheduling a
// boost is Phase B (Stripe one-off / Pro-included).
const DURATIONS = [
  { key: '24h', label: '24h', sub: 'before show' },
  { key: '3d', label: '3 days', sub: 'most popular' },
  { key: 'til', label: 'Til event', sub: 'best reach' },
] as const

export default function BoostScreen() {
  const router = useRouter()
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]['key']>('3d')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Boost a show" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {/* Selected event header (mockup .cmpev) */}
        <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-ink-line bg-surface p-3 shadow-card">
          <View className="h-[54px] w-[54px] rounded-[13px] bg-coral" />
          <View className="flex-1">
            <Text className="text-[15px] font-bold text-ink">Chloe Kimes & The Tide</Text>
            <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">Sat Jun 14 · 8:30 PM · Surfer the Bar</Text>
          </View>
        </View>

        <View className="mb-4 flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: '#0E1A2E' }}>
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <IconTrendingUp size={22} color="#B7F34A" />
          </View>
          <View className="flex-1">
            <Text className="text-[22px] font-black tracking-tight text-white">~1,200 fans</Text>
            <Text className="text-[12px] font-semibold text-white/70">in range around the Beaches this week</Text>
          </View>
        </View>

        <Text className="mb-2.5 text-[13px] font-extrabold text-ink-slate">How long</Text>
        <View className="mb-4 flex-row gap-2">
          {DURATIONS.map((d) => {
            const on = d.key === duration
            return (
              <Pressable
                key={d.key}
                onPress={() => setDuration(d.key)}
                className={`flex-1 items-center rounded-[13px] border-[1.5px] py-3 ${on ? 'border-coral bg-[#FFF6F6]' : 'border-ink-line bg-surface'}`}
              >
                <Text className={`text-[15px] font-extrabold ${on ? 'text-coral' : 'text-ink'}`}>{d.label}</Text>
                <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">{d.sub}</Text>
              </Pressable>
            )
          })}
        </View>

        <View className="mb-3.5 flex-row items-center gap-2.5 rounded-xl bg-teal-soft px-3 py-3">
          <IconEyeCheck size={16} color="#0F6E56" />
          <Text className="flex-1 text-[12.5px] font-bold text-teal">
            Top of Tonight & a highlighted map pin. We only ever charge for impressions — never promised sales.
          </Text>
        </View>

        {/* Pro-included guard (mockup .guard + .inclpro) */}
        <View className="mb-4 flex-row items-center gap-2.5 rounded-xl border border-ink-line bg-surface px-3 py-3">
          <IconDiscount2 size={18} color="#0F6E56" />
          <Text className="flex-1 text-[12.5px] font-semibold text-ink-slate">
            You're on <Text className="font-extrabold text-ink">Venue Pro</Text> — boosts are included.
          </Text>
          <View className="flex-row items-center gap-1 rounded-full px-2 py-1" style={{ backgroundColor: '#E1F5EE' }}>
            <Text className="text-[10px] font-extrabold" style={{ color: '#0F6E56' }}>✓ Included</Text>
          </View>
        </View>

        <GradientButton
          label="Boost this show"
          icon={IconRocket}
          onPress={() => Alert.alert('Boost', 'Boost scheduling — wiring in progress (Pro includes boosts).')}
        />
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          <IconInfoCircle size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">On Free? A single boost is $5 — no subscription needed.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
