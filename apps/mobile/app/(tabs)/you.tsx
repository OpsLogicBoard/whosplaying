import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFollows } from '@whosplaying/core'
import { useAppMode } from '../../lib/appMode'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

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
  const { mode, setMode } = useAppMode()
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const email = session?.user?.email ?? ''

  const { data: profile } = useQuery({
    queryKey: ['profile', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, home_city, avatar_url')
        .eq('id', userId as string)
        .single()
      if (error) throw error
      return data as { display_name: string | null; home_city: string | null; avatar_url: string | null }
    },
  })

  const name = profile?.display_name?.trim() || email.split('@')[0] || 'You'
  const city = profile?.home_city?.trim() || null
  const followCount = useFollows(userId).data.length

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
        <Pressable
          onPress={() => router.push('/edit-profile')}
          className="flex-row items-center gap-4"
        >
          <View className="h-[68px] w-[68px] items-center justify-center rounded-full bg-purple">
            <Text className="text-[24px] font-extrabold text-white">{initials(name)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[21px] font-extrabold text-ink-deep" numberOfLines={1}>
              {name}
            </Text>
            <Text className="mt-0.5 text-[13px] font-semibold text-ink-slate">
              Music goer{city ? ` · ${city}` : ''}
            </Text>
          </View>
          <Feather name="edit-2" size={18} color="#9AA1AC" />
        </Pressable>

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
        {mode === 'manage' ? (
          <View className="mt-3">
            {[
              {
                key: 'bookings',
                icon: 'calendar' as const,
                label: 'Your shows',
                sub: 'Bookings & lineup confirmation',
                onPress: () => router.push('/bookings'),
              },
              {
                key: 'gigs',
                icon: 'briefcase' as const,
                label: 'Open gigs',
                sub: 'Post a gig · review bids',
                onPress: () => router.push('/gig-board'),
              },
            ].map((m) => (
              <Pressable
                key={m.key}
                onPress={m.onPress}
                className="mb-3 flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-4"
              >
                <View className="h-11 w-11 items-center justify-center rounded-md bg-[#EEF0F4]">
                  <Feather name={m.icon} size={20} color="#5C6470" />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-ink">{m.label}</Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{m.sub}</Text>
                </View>
                <Feather name="chevron-right" size={18} color="#9AA1AC" />
              </Pressable>
            ))}
          </View>
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
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                  {h.title === 'Music goer'
                    ? `Following ${followCount} ${followCount === 1 ? 'act' : 'acts'}`
                    : h.sub}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9AA1AC" />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.push('/create-event')}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-coral py-4"
        >
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
