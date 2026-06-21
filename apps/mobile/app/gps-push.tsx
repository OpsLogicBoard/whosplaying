import {
  IconBellCheck,
  IconBolt,
  IconMapPin,
  IconSend,
  IconShieldCheck,
  IconUsers,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useRef, useState } from 'react'
import { Alert, PanResponder, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton } from '../components/ui'

// GPS push composer (mockup m-gpspush). Reach radius is the prototype's range
// slider (.rad) — a self-contained tap/drag slider so it matches the mockup
// without pulling in a native slider dependency. Sending is Phase B.
const MIN_MI = 0.5
const MAX_MI = 5
const STEP_MI = 0.5

/** Tap/drag reach-radius slider (mockup .rad input) — no external dependency. */
function RadiusSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const widthRef = useRef(1)
  const setFromX = (x: number) => {
    const pct = Math.max(0, Math.min(1, x / (widthRef.current || 1)))
    const raw = MIN_MI + pct * (MAX_MI - MIN_MI)
    const snapped = Math.min(MAX_MI, Math.max(MIN_MI, Math.round(raw / STEP_MI) * STEP_MI))
    onChange(snapped)
  }
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => setFromX(e.nativeEvent.locationX),
      onPanResponderMove: (e) => setFromX(e.nativeEvent.locationX),
    }),
  ).current
  const pct = (value - MIN_MI) / (MAX_MI - MIN_MI)
  return (
    <View
      className="h-6 flex-1 justify-center"
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width
      }}
      {...pan.panHandlers}
    >
      <View className="h-1.5 rounded-full bg-[#EEF0F4]">
        <View className="h-full rounded-full bg-coral" style={{ width: `${pct * 100}%` }} />
      </View>
      <View
        className="absolute h-5 w-5 rounded-full border-2 border-coral bg-white"
        style={{ left: `${pct * 100}%`, marginLeft: -10 }}
      />
    </View>
  )
}

export default function GpsPushScreen() {
  const router = useRouter()
  const [msg, setMsg] = useState('$4 SunCruisers til close — live music starting now at Surfer the Bar 🎶')
  const [radius, setRadius] = useState(2)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Push to nearby fans" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <Text className="mb-2 text-[13px] font-extrabold text-ink-slate">Message</Text>
        <TextInput
          value={msg}
          onChangeText={(t) => setMsg(t.slice(0, 140))}
          multiline
          className="min-h-[84px] rounded-2xl border border-ink-line bg-surface p-3.5 text-[14px] text-ink"
          placeholderTextColor="#9AA1AC"
          textAlignVertical="top"
        />
        <Text className="mb-4 mt-1.5 text-right text-[11px] font-bold text-ink-mute">{msg.length}/140</Text>

        <Text className="mb-2 text-[13px] font-extrabold text-ink-slate">Reach radius</Text>
        {/* Range slider in a card (mockup .rad) — pin · slider · live mi readout. */}
        <View className="mb-4 flex-row items-center gap-3 rounded-2xl border border-ink-line bg-surface p-3.5">
          <IconMapPin size={19} color="#FF5A5F" />
          <RadiusSlider value={radius} onChange={setRadius} />
          <Text className="w-12 text-right text-[13.5px] font-extrabold text-ink-deep">{radius} mi</Text>
        </View>

        <View className="mb-3.5 flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: '#0E1A2E' }}>
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <IconUsers size={22} color="#B7F34A" />
          </View>
          <View className="flex-1">
            <Text className="text-[22px] font-black tracking-tight text-white">~340 fans</Text>
            <Text className="text-[12px] font-semibold text-white/70">browsing within {radius} mi right now</Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center gap-2.5 rounded-xl bg-teal-soft px-3 py-3">
          <IconBellCheck size={16} color="#0F6E56" />
          <Text className="flex-1 text-[12.5px] font-bold text-teal">1 of 2 daily pushes used — 1 left today</Text>
        </View>
        <View className="mb-4 flex-row gap-2.5 px-1">
          <IconShieldCheck size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            Capped to protect fans: at most 1–2 pushes a day across all venues, and anyone can mute. Over-pushing loses
            the audience we're here to grow.
          </Text>
        </View>

        <GradientButton
          label="Send to nearby fans"
          icon={IconSend}
          onPress={() => Alert.alert('GPS push', 'Sending to nearby fans — wiring in progress (Venue Pro feature).')}
        />
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          <IconBolt size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">Venue Pro feature · GPS push is never sold à la carte</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
