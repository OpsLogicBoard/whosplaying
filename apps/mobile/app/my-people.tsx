import { IconMessage2, IconPlus, IconSearch, IconUsers } from '@tabler/icons-react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

type Follower = { id: string; name: string; city: string | null }

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

const AV = ['#FF3F73', '#2D7FF9', '#8B5CF6', '#FFB020', '#1D9E75', '#23272F']

// Collaborators surface (sample until the play-history join ships).
const COLLABORATORS = [
  { id: 'c1', initials: 'TT', color: '#2D7FF9', name: 'The Tide', sub: 'Band · 8 shows together' },
  { id: 'c2', initials: 'CK', color: '#8B5CF6', name: 'Chloe Kimes', sub: 'Vocalist · 5 shows together' },
  { id: 'c3', initials: 'MW', color: '#FFB020', name: 'Marcus Webb', sub: 'Drummer · 12 shows together' },
  { id: 'c4', initials: 'LT', color: '#1D9E75', name: 'Low Tide Social Club', sub: 'Band · 4 shows together' },
  { id: 'c5', initials: 'RB', color: '#FF3F73', name: 'Rosa Bel', sub: 'Fiddle · 7 shows together' },
  { id: 'c6', initials: 'EH', color: '#23272F', name: 'Eli Hart', sub: 'Bassist · 9 shows together' },
]

export default function MyPeopleScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [tab, setTab] = useState<'followers' | 'collaborators'>('followers')

  const followers = useQuery({
    queryKey: ['my-followers', userId ?? null],
    enabled: !!userId && tab === 'followers',
    queryFn: async (): Promise<Follower[]> => {
      const { data: venues } = await supabase.from('venues').select('id').eq('owner_user_id', userId as string)
      const venueIds = ((venues ?? []) as { id: string }[]).map((v) => v.id)
      if (!venueIds.length) return []
      const { data: rows } = await supabase
        .from('follows')
        .select('follower_user_id')
        .eq('target_type', 'venue')
        .in('target_id', venueIds)
      const followerIds = [...new Set(((rows ?? []) as { follower_user_id: string }[]).map((r) => r.follower_user_id))]
      if (!followerIds.length) return []
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, home_city')
        .in('id', followerIds)
      return ((profiles ?? []) as { id: string; display_name: string | null; home_city: string | null }[]).map((p) => ({
        id: p.id,
        name: p.display_name?.trim() || 'Fan',
        city: p.home_city,
      }))
    },
  })

  const followerCount = (followers.data ?? []).length
  const followerLabel = followerCount >= 1000 ? `${(followerCount / 1000).toFixed(1)}k` : `${followerCount}`

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="My people" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {/* Tabs with counts */}
        <View className="flex-row rounded-xl bg-[#EEF0F4] p-[3px]">
          {(
            [
              { v: 'followers', label: 'Followers', count: followerLabel },
              { v: 'collaborators', label: 'Collaborators', count: `${COLLABORATORS.length}` },
            ] as const
          ).map((t) => {
            const on = tab === t.v
            return (
              <Pressable
                key={t.v}
                onPress={() => setTab(t.v)}
                className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-[9px] py-2 ${on ? 'bg-surface' : ''}`}
              >
                <Text className={`text-[13px] font-bold ${on ? 'text-ink' : 'text-ink-slate'}`}>{t.label}</Text>
                <Text className={`text-[11px] font-extrabold ${on ? 'text-ink-mute' : 'text-ink-mute'}`}>{t.count}</Text>
              </Pressable>
            )
          })}
        </View>

        {/* Search */}
        <View className="mt-3.5 flex-row items-center gap-2 rounded-2xl border border-ink-line bg-surface px-4 py-3">
          <IconSearch size={16} color="#9AA1AC" />
          <Text className="text-[14px] font-semibold text-ink-mute">
            Search {tab === 'followers' ? 'followers' : 'collaborators'}
          </Text>
        </View>

        {tab === 'followers' ? (
          followers.isLoading ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color="#FF5A5F" />
            </View>
          ) : followerCount === 0 ? (
            <View className="mt-16 items-center px-6">
              <IconUsers size={28} color="#9AA1AC" />
              <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No followers yet</Text>
              <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
                Fans who follow your venue will show up here.
              </Text>
            </View>
          ) : (
            <View className="mt-3">
              {(followers.data ?? []).map((f, i) => (
                <View key={f.id} className="flex-row items-center gap-3 border-b border-ink-line py-3">
                  <View
                    className="h-[46px] w-[46px] items-center justify-center rounded-full"
                    style={{ backgroundColor: AV[i % AV.length] }}
                  >
                    <Text className="text-[15px] font-extrabold text-white">{initials(f.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-ink">{f.name}</Text>
                    {f.city ? (
                      <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{f.city}</Text>
                    ) : null}
                  </View>
                  <View className="rounded-full bg-green-soft px-2.5 py-1">
                    <Text className="text-[10px] font-extrabold uppercase tracking-wide text-green">Fan</Text>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          <View className="mt-3">
            {/* Add a collaborator */}
            <Pressable className="mb-1 flex-row items-center gap-3 border-b border-ink-line py-3">
              <View className="h-[46px] w-[46px] items-center justify-center rounded-full border border-dashed border-ink-mute bg-surface">
                <IconPlus size={20} color="#5C6470" />
              </View>
              <Text className="text-[15px] font-extrabold text-ink">Add a collaborator</Text>
            </Pressable>
            {COLLABORATORS.map((c) => (
              <View key={c.id} className="flex-row items-center gap-3 border-b border-ink-line py-3">
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={{ backgroundColor: c.color }}
                >
                  <Text className="text-[15px] font-extrabold text-white">{c.initials}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-ink">{c.name}</Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{c.sub}</Text>
                </View>
                <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-[#EEF0F4]">
                  <IconMessage2 size={18} color="#5C6470" />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
