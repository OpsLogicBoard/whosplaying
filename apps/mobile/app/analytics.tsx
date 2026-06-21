import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, LockCard } from '../components/ui'

// Analytics (mockup m-analytics). The aggregation backend isn't built yet, so
// the Free stat cards show sample figures (flagged) and the full funnel sits
// behind the Pro lock-card. Wire to real view/tap counts when available.
const RANGES = ['7 days', '30 days', '90 days'] as const
const SPARK = [40, 55, 48, 70, 62, 88, 100]

export default function AnalyticsScreen() {
  const router = useRouter()
  const [range, setRange] = useState<(typeof RANGES)[number]>('30 days')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Analytics" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="flex-row gap-2">
          {RANGES.map((r) => {
            const on = r === range
            return (
              <Pressable
                key={r}
                onPress={() => setRange(r)}
                className={`rounded-full px-4 py-2 ${on ? 'bg-ink-deep' : 'border border-ink-line bg-surface'}`}
              >
                <Text className={`text-[12.5px] font-bold ${on ? 'text-white' : 'text-ink-slate'}`}>{r}</Text>
              </Pressable>
            )
          })}
        </View>

        <View className="mb-3 mt-4 flex-row items-center gap-1.5 self-start rounded-full bg-[#F2F3F6] px-2.5 py-1">
          <Feather name="info" size={11} color="#9AA1AC" />
          <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Sample data</Text>
        </View>

        <Text className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Included with Free</Text>

        <View className="mb-3 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
          <View className="flex-row items-center gap-2">
            <Feather name="eye" size={16} color="#2D7FF9" />
            <Text className="text-[12px] font-bold text-ink-slate">Profile & event views</Text>
            <View className="flex-row items-center">
              <Feather name="arrow-up-right" size={12} color="#0F6E56" />
              <Text className="text-[12px] font-extrabold text-teal">18%</Text>
            </View>
          </View>
          <Text className="mt-1.5 text-[30px] font-black tracking-tight text-ink-deep">2,840</Text>
          <View className="mt-3 h-[38px] flex-row items-end gap-1">
            {SPARK.map((h, i) => (
              <View
                key={i}
                style={{ height: `${h}%`, backgroundColor: i >= 5 ? '#FF5A5F' : '#E1F5EE' }}
                className="flex-1 rounded-t"
              />
            ))}
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
          <View className="flex-row items-center gap-2">
            <Feather name="external-link" size={16} color="#FF5A5F" />
            <Text className="text-[12px] font-bold text-ink-slate">Get Tickets taps</Text>
            <View className="flex-row items-center">
              <Feather name="arrow-up-right" size={12} color="#0F6E56" />
              <Text className="text-[12px] font-extrabold text-teal">9%</Text>
            </View>
          </View>
          <Text className="mt-1.5 text-[30px] font-black tracking-tight text-ink-deep">213</Text>
        </View>

        <Text className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Full analytics</Text>
        <LockCard
          title="See the full funnel"
          body="Views → taps conversion, follower growth, and your top-performing shows. Upgrade to unlock."
          ctaLabel="Unlock · $14.99/mo"
          onUnlock={() => router.push('/plan')}
        />

        <View className="mt-2 flex-row gap-2.5 px-1">
          <Feather name="info" size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            We show what we can prove — <Text className="font-extrabold">views, taps & follows</Text>. Completed ticket
            sales live in your Eventbrite / DICE dashboard (Who's Playing shows as a traffic source via the link tag).
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
