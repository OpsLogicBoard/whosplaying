import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton } from '../components/ui'

// GPS push composer (mockup m-gpspush). Radius uses preset chips (no slider
// dep). Reach is an estimate; sending is Phase B (Venue Pro feature).
const RADII = [0.5, 1, 2, 3, 5]

export default function GpsPushScreen() {
  const router = useRouter()
  const [msg, setMsg] = useState('$4 SunCruisers til close — live music starting now 🎶')
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
        <View className="mb-4 flex-row gap-2">
          {RADII.map((r) => {
            const on = r === radius
            return (
              <Pressable
                key={r}
                onPress={() => setRadius(r)}
                className={`flex-1 items-center rounded-xl border py-2.5 ${on ? 'border-ink-deep bg-ink-deep' : 'border-ink-line bg-surface'}`}
              >
                <Text className={`text-[12px] font-bold ${on ? 'text-white' : 'text-ink-slate'}`}>{r} mi</Text>
              </Pressable>
            )
          })}
        </View>

        <View className="mb-3.5 flex-row items-center gap-3 rounded-2xl p-4" style={{ backgroundColor: '#0E1A2E' }}>
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <Feather name="users" size={22} color="#B7F34A" />
          </View>
          <View className="flex-1">
            <Text className="text-[22px] font-black tracking-tight text-white">~340 fans</Text>
            <Text className="text-[12px] font-semibold text-white/70">browsing within {radius} mi right now (est.)</Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center gap-2.5 rounded-xl bg-teal-soft px-3 py-3">
          <Feather name="bell" size={16} color="#0F6E56" />
          <Text className="flex-1 text-[12.5px] font-bold text-teal">1 of 2 daily pushes used — 1 left today</Text>
        </View>
        <View className="mb-4 flex-row gap-2.5 px-1">
          <Feather name="shield" size={14} color="#FF5A5F" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12px] font-semibold leading-5 text-ink-slate">
            Capped to protect fans: at most 1–2 pushes a day across all venues, and anyone can mute. Over-pushing loses
            the audience we're here to grow.
          </Text>
        </View>

        <GradientButton
          label="Send to nearby fans"
          icon="send"
          onPress={() => Alert.alert('GPS push', 'Sending to nearby fans — wiring in progress (Venue Pro feature).')}
        />
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          <Feather name="zap" size={12} color="#9AA1AC" />
          <Text className="text-[11px] font-semibold text-ink-mute">Venue Pro feature · GPS push is never sold à la carte</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
