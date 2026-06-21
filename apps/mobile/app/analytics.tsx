import {
  IconArrowUpRight,
  IconEye,
  IconInfoCircle,
  IconReceipt2,
  IconTicket,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, LockCard } from '../components/ui'

// Analytics (mockup m-analytics). The aggregation backend isn't built yet, so
// the Free stat cards show sample figures and the full funnel is rendered both
// behind the Pro lock-card and as the unlocked Pro state (mockup shows both for
// build visibility). Wire to real view/tap counts when available.
const RANGES = ['7 days', '30 days', '90 days'] as const
const SPARK = [40, 55, 48, 70, 62, 88, 100]

// Pro funnel rows (mockup .anfunnel). Bar colors: b1 coral, b2 blue, b3 purple.
const FUNNEL = [
  { label: 'Views', value: '2,840', pct: '100%', width: '100%', color: '#FF5A5F' },
  { label: 'Get Tickets taps', value: '213', pct: '7.5%', width: '42%', color: '#2D7FF9' },
  { label: 'New followers', value: '96', pct: '+96', width: '28%', color: '#8B5CF6' },
]

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

        <Text className="mb-3 mt-4 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Included with Free</Text>

        <View className="mb-3 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
          <View className="flex-row items-center gap-2">
            <IconEye size={16} color="#2D7FF9" />
            <Text className="text-[12px] font-bold text-ink-slate">Profile & event views</Text>
            <View className="flex-row items-center">
              <IconArrowUpRight size={12} color="#0F6E56" />
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
            <IconTicket size={16} color="#FF5A5F" />
            <Text className="text-[12px] font-bold text-ink-slate">Get Tickets taps</Text>
            <View className="flex-row items-center">
              <IconArrowUpRight size={12} color="#0F6E56" />
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

        {/* Pro state (what unlocks) — funnel rows (mockup .anfunnel). */}
        <View className="mt-4 gap-3 rounded-2xl border border-ink-line bg-surface p-4 shadow-card">
          {FUNNEL.map((f) => (
            <View key={f.label}>
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-[13px] font-semibold text-ink-slate">{f.label}</Text>
                <Text className="text-[14px] font-extrabold text-ink-deep">{f.value}</Text>
              </View>
              <View className="h-6 justify-center overflow-hidden rounded-lg bg-[#F2F4F7]">
                <View
                  className="h-full justify-center rounded-lg px-2"
                  style={{ width: f.width as `${number}%`, backgroundColor: f.color }}
                >
                  <Text className="text-[11px] font-extrabold text-white">{f.pct}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="mt-3 flex-row gap-2.5 px-1">
          <IconInfoCircle size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            We show what we can prove — <Text className="font-extrabold">views, taps & follows</Text>. Completed ticket
            sales live in your Eventbrite / DICE dashboard (Who's Playing shows as a traffic source via the link tag).
          </Text>
        </View>

        <View className="mt-4">
          <Pressable
            onPress={() => router.push('/billing')}
            className="flex-row items-center justify-center gap-2 rounded-[15px] border border-ink-line bg-surface py-3.5"
          >
            <IconReceipt2 size={17} color="#071020" />
            <Text className="text-[14px] font-extrabold text-ink-deep">Plan & billing</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
