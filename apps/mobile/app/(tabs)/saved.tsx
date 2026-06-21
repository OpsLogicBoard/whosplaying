import { IconHeart, IconBell, IconBellOff, IconWifiOff, IconCalendar } from '@tabler/icons-react-native'
import type { TablerIcon } from '../../components/icon'
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

// `detail` is a placeholder genre/location — the SavedFollow shape doesn't yet
// carry the artist genre or venue city, so this keeps the mockup's
// "Type · genre/location" subtitle structure.
const TYPE_META: Record<TargetType, { label: string; color: string; detail: string }> = {
  venue: { label: 'Venue', color: '#1D9E75', detail: 'Jacksonville Beach' },
  artist: { label: 'Artist', color: '#2D7FF9', detail: 'roots rock' },
  band: { label: 'Band', color: '#8B5CF6', detail: 'indie' },
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
        <View className="mt-1">
          <Segmented
            value={tab}
            onChange={setTab}
            options={[
              { value: 'following', label: 'Following' },
              { value: 'shows', label: 'Shows' },
            ]}
          />
        </View>

        {tab === 'following' ? (
          isLoading ? (
            <View className="mt-16 items-center">
              <ActivityIndicator color="#FF5A5F" />
            </View>
          ) : error ? (
            <EmptyState icon={IconWifiOff} title="Couldn’t load" sub="Pull to retry." />
          ) : follows.length === 0 ? (
            <EmptyState icon={IconHeart} title="Nothing followed yet" sub="Follow venues, artists, and bands to see them here." />
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
                      className="h-[46px] w-[46px] items-center justify-center rounded-2xl"
                      style={{ backgroundColor: meta.color }}
                    >
                      <Text className="text-[15px] font-extrabold text-white">{initials(f.name)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                        {meta.label} · {meta.detail}
                      </Text>
                    </View>
                    <IconHeart size={20} color="#FF5A5F" fill="#FF5A5F" strokeWidth={2} />
                  </Pressable>
                )
              })}
            </View>
          )
        ) : followedVenueIds.length === 0 ? (
          <EmptyState icon={IconCalendar} title="No shows yet" sub="Follow a venue to track its upcoming shows here." />
        ) : shows.isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : (shows.data ?? []).length === 0 ? (
          <EmptyState icon={IconCalendar} title="No upcoming shows" sub="Nothing booked yet at the venues you follow." />
        ) : (
          <View className="mt-4">
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-[13px] font-extrabold text-ink-deep">Upcoming</Text>
              <Text className="text-[12.5px] font-bold text-coral">Alerts on</Text>
            </View>
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
                      {s.venue}
                    </Text>
                    <Text className="mt-0.5 text-[12px] font-semibold text-ink-mute" numberOfLines={1}>
                      {showWhen(s.starts_at)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setMutedShows((m) => ({ ...m, [s.id]: !m[s.id] }))}
                    hitSlop={8}
                    className="h-[34px] w-[34px] items-center justify-center rounded-full"
                    style={{ backgroundColor: muted ? '#EEF0F4' : '#FFF1F1' }}
                  >
                    {muted ? (
                      <IconBellOff size={16} color="#9AA1AC" strokeWidth={2} />
                    ) : (
                      <IconBell size={16} color="#FF5A5F" strokeWidth={2} />
                    )}
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
  icon: Icon,
  title,
  sub,
}: {
  icon: TablerIcon
  title: string
  sub: string
}) {
  return (
    <View className="mt-12 items-center px-6">
      <Icon size={28} color="#9AA1AC" strokeWidth={2} />
      <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">{title}</Text>
      <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">{sub}</Text>
    </View>
  )
}
