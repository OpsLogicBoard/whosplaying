import { Feather } from '@expo/vector-icons'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAppMode } from '../../lib/appMode'

const hats = [
  { icon: 'headphones', tint: '#FFF1F1', color: '#FF5A5F', title: 'Music goer', sub: 'Following 5 · 8 saved shows' },
  { icon: 'mic', tint: '#EEEDFE', color: '#8B5CF6', title: 'Are you an artist?', sub: 'Create a profile · solo or with bands' },
  { icon: 'home', tint: '#E6F1FB', color: '#2D7FF9', title: 'Run a venue?', sub: 'Claim it · validated via Google Maps' },
] as const

const connections = [
  { icon: 'instagram', label: 'Instagram, Spotify, Apple Music' },
  { icon: 'calendar', label: 'Calendar export (ICS)' },
  { icon: 'bell', label: 'Notifications & alerts' },
  { icon: 'grid', label: 'Share my profile (QR)' },
] as const

export default function YouScreen() {
  const { mode, setMode, canManage } = useAppMode()
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
        <View className="flex-row items-center gap-4">
          <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-purple">
            <Text className="text-[24px] font-extrabold text-white">JW</Text>
          </View>
          <View>
            <Text className="text-[21px] font-extrabold text-ink-deep">James W.</Text>
            <Text className="mt-0.5 text-[13px] font-semibold text-ink-slate">Music goer · Jacksonville Beach</Text>
          </View>
        </View>

        {/* Work/Play selector — entry point to the artist/venue Manage mode */}
        <View className="mt-5 flex-row rounded-xl bg-[#EEF0F4] p-1">
          {(['play', 'manage'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-lg py-2.5 ${mode === m ? 'bg-surface' : ''}`}
            >
              <Feather name={m === 'play' ? 'music' : 'briefcase'} size={14} color={mode === m ? '#111318' : '#5C6470'} />
              <Text className={`text-[13px] font-bold ${mode === m ? 'text-ink' : 'text-ink-slate'}`}>
                {m === 'play' ? 'Play' : 'Work'}
              </Text>
            </Pressable>
          ))}
        </View>
        {mode === 'manage' && !canManage ? (
          <Text className="mt-2 text-[12.5px] font-semibold text-ink-mute">
            Artist & venue tools are coming soon. Create an artist or venue profile below to unlock Work mode.
          </Text>
        ) : null}

        <Text className="mt-6 text-[18px] font-extrabold text-ink-deep">Your hats</Text>
        <View className="mt-3">
          {hats.map((h) => (
            <Pressable key={h.title} className="mb-3 flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-4">
              <View className="h-11 w-11 items-center justify-center rounded-md" style={{ backgroundColor: h.tint }}>
                <Feather name={h.icon} size={20} color={h.color} />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-ink">{h.title}</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{h.sub}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9AA1AC" />
            </Pressable>
          ))}
        </View>

        <Pressable className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-coral py-4">
          <Feather name="plus" size={18} color="#FFFFFF" />
          <Text className="text-[15px] font-extrabold text-white">Create event</Text>
        </Pressable>

        <Text className="mt-6 text-[18px] font-extrabold text-ink-deep">Connections</Text>
        <View className="mt-2">
          {connections.map((c) => (
            <Pressable key={c.label} className="flex-row items-center gap-3 border-b border-ink-line py-4">
              <Feather name={c.icon} size={19} color="#5C6470" />
              <Text className="flex-1 text-[14.5px] font-semibold text-ink">{c.label}</Text>
              <Feather name="chevron-right" size={18} color="#9AA1AC" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
