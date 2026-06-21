import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSavedFollows, type SavedFollow } from '@whosplaying/core'
import { Segmented } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

type TargetType = SavedFollow['type']

const TYPE_META: Record<
  TargetType,
  { label: string; icon: keyof typeof Feather.glyphMap; color: string }
> = {
  venue: { label: 'Venue', icon: 'home', color: '#1D9E75' },
  artist: { label: 'Artist', icon: 'mic', color: '#2D7FF9' },
  band: { label: 'Band', icon: 'users', color: '#8B5CF6' },
}

type SavedShow = {
  id: string
  title: string
  starts_at: string
  venue: string
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

function dateBadge(iso: string): { mon: string; day: string } {
  const d = new Date(iso)
  return {
    mon: d.toLocaleDateString(undefined, { month: 'short' }),
    day: d.getDate().toString(),
  }
}

function showWhen(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' })
  return `${wd} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function SavedScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const [tab, setTab] = useState<'following' | 'shows'>('following')
  const [mutedShows, setMutedShows] = useState<Record<string, boolean>>({})

  const { data: follows, isLoading, error, refetch, isRefetching } = useSavedFollows(userId)

  const followedVenueIds = useMemo(
    () => follows.filter((f) => f.type === 'venue').map((f) => f.id),
    [follows],
  )

  // "Shows" = upcoming confirmed events at the venues you follow.
  const shows = useQuery({
    queryKey: ['saved-shows', followedVenueIds.sort().join(',')],
    enabled: tab === 'shows' && followedVenueIds.length > 0,
    queryFn: async (): Promise<SavedShow[]> => {
      const { data, error: e } = await supabase
        .from('events')
        .select('id, title, starts_at, venue:venues(name)')
        .in('venue_id', followedVenueIds)
        .eq('status', 'confirmed')
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
      if (e) throw e
      return ((data ?? []) as unknown as { id: string; title: string; starts_at: string; venue: { name: string } | null }[]).map(
        (r) => ({ id: r.id, title: r.title, starts_at: r.starts_at, venue: r.venue?.name ?? 'TBA' }),
      )
    },
  })

  const openFollow = (f: SavedFollow) => {
    if (f.type === 'venue') router.push(`/venue/${f.id}`)
    else if (f.type === 'artist') router.push(`/artist/${f.id}`)
    else router.push(`/band/${f.id}`)
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5A5F" />
        }
      >
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          <Text className="text-coral">Saved.</Text>
        </Text>
        <Text className="mb-4 mt-1 text-[13px] font-semibold text-ink-slate">
          Acts you follow and shows you’re tracking.
        </Text>

        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'following', label: 'Following' },
            { value: 'shows', label: 'Shows' },
          ]}
        />

        {tab === 'following' ? (
          isLoading ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color="#FF5A5F" />
            </View>
          ) : error ? (
            <EmptyState icon="wifi-off" title="Couldn’t load" sub="Pull to retry." />
          ) : follows.length === 0 ? (
            <EmptyState icon="heart" title="Nothing followed yet" sub="Follow venues, artists, and bands to see them here." />
          ) : (
            <View className="mt-4">
              {follows.map((f) => {
                const meta = TYPE_META[f.type]
                return (
                  <Pressable
                    key={`${f.type}-${f.id}`}
                    onPress={() => openFollow(f)}
                    className="flex-row items-center gap-3 border-b border-ink-line py-3"
                  >
                    <View
                      className="h-[46px] w-[46px] items-center justify-center rounded-full"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Text className="text-[15px] font-extrabold text-white">{initials(f.name)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{meta.label}</Text>
                    </View>
                    <Feather name="heart" size={20} color="#FF5A5F" />
                  </Pressable>
                )
              })}
            </View>
          )
        ) : followedVenueIds.length === 0 ? (
          <EmptyState icon="calendar" title="No shows yet" sub="Follow a venue to track its upcoming shows here." />
        ) : shows.isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : (shows.data ?? []).length === 0 ? (
          <EmptyState icon="calendar" title="No upcoming shows" sub="Nothing booked yet at the venues you follow." />
        ) : (
          <View className="mt-4">
            {(shows.data ?? []).map((s) => {
              const b = dateBadge(s.starts_at)
              const muted = mutedShows[s.id]
              return (
                <Pressable
                  key={s.id}
                  onPress={() => router.push(`/event/${s.id}`)}
                  className="mb-3 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3 shadow-card"
                >
                  <View className="h-14 w-[52px] items-center justify-center rounded-[13px] bg-coral-soft">
                    <Text className="text-[10.5px] font-extrabold uppercase text-coral">{b.mon}</Text>
                    <Text className="text-[21px] font-extrabold leading-none text-coral">{b.day}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                      {s.title}
                    </Text>
                    <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                      {s.venue} · {showWhen(s.starts_at)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setMutedShows((m) => ({ ...m, [s.id]: !m[s.id] }))}
                    hitSlop={8}
                    className="h-[34px] w-[34px] items-center justify-center rounded-full"
                    style={{ backgroundColor: muted ? '#EEF0F4' : '#FFF1F1' }}
                  >
                    <Feather name={muted ? 'bell-off' : 'bell'} size={16} color={muted ? '#9AA1AC' : '#FF5A5F'} />
                  </Pressable>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function EmptyState({
  icon,
  title,
  sub,
}: {
  icon: keyof typeof Feather.glyphMap
  title: string
  sub: string
}) {
  return (
    <View className="mt-12 items-center px-6">
      <Feather name={icon} size={28} color="#9AA1AC" />
      <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">{title}</Text>
      <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">{sub}</Text>
    </View>
  )
}
