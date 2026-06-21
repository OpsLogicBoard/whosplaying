import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, Segmented } from '../components/ui'
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

export default function MyPeopleScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [tab, setTab] = useState<'followers' | 'collaborators'>('followers')

  // Real followers of the venues this user owns (read-restricted by RLS → may
  // be empty, in which case the empty state shows).
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

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="My people" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'followers', label: 'Followers' },
            { value: 'collaborators', label: 'Collaborators' },
          ]}
        />

        {tab === 'followers' ? (
          followers.isLoading ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color="#FF5A5F" />
            </View>
          ) : (followers.data ?? []).length === 0 ? (
            <View className="mt-16 items-center px-6">
              <Feather name="users" size={28} color="#9AA1AC" />
              <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No followers yet</Text>
              <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
                Fans who follow your venue will show up here.
              </Text>
            </View>
          ) : (
            <View className="mt-4">
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
                    {f.city ? <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{f.city}</Text> : null}
                  </View>
                  <View className="rounded-full bg-teal-soft px-2 py-1">
                    <Text className="text-[10px] font-extrabold uppercase tracking-wide text-teal">Fan</Text>
                  </View>
                </View>
              ))}
            </View>
          )
        ) : (
          <View className="mt-16 items-center px-6">
            <Feather name="user-plus" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No collaborators yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Bands and artists you play with will appear here once you've shared a show.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
