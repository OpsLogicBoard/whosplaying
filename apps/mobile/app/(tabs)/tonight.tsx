import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvents, type EventWithRelations } from '@whosplaying/core'
import { Scrim } from '../../components/ui'

// Accent palette for the "Also tonight" thumbnails (cycled by index).
const THUMBS = ['#2D7FF9', '#FFB020', '#1D9E75', '#8B5CF6', '#FF5A5F']

function todayRange() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  return { from: start, to: end }
}

function timeLabel(iso: string): { time: string; ampm: string } {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return { time: `${h}:${m.toString().padStart(2, '0')}`, ampm }
}

/** A show counts as "live now" once its start time has passed (it's playing). */
function isLive(iso: string): boolean {
  return new Date(iso).getTime() <= Date.now()
}

export default function TonightScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const { from, to } = useMemo(todayRange, [])
  const { data: events, isLoading, error, refetch, isRefetching } = useEvents({
    from,
    to,
    status: 'confirmed',
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.venue?.name ?? '').toLowerCase().includes(q),
    )
  }, [events, search])

  const featured = filtered[0] as EventWithRelations | undefined
  const rest = filtered.slice(1)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5A5F" />
        }
      >
        <View className="flex-row items-center justify-between pt-1">
          <Pressable className="flex-row items-center gap-1 py-1">
            <Text className="text-[17px] font-extrabold text-ink-deep">Jacksonville Beach</Text>
            <Feather name="chevron-down" size={18} color="#5C6470" />
          </Pressable>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface">
            <Feather name="bell" size={19} color="#071020" />
            <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-coral" />
          </Pressable>
        </View>

        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Playing <Text className="text-coral">tonight.</Text>
        </Text>

        <View className="mt-4 h-12 flex-row items-center rounded-2xl border border-ink-line bg-surface px-4">
          <Feather name="search" size={18} color="#9AA1AC" />
          <TextInput
            className="ml-2 flex-1 text-[15px] text-ink"
            placeholder="Search events, artists, venues"
            placeholderTextColor="#9AA1AC"
            returnKeyType="search"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-10 items-center px-6">
            <Feather name="wifi-off" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load tonight’s shows. Pull to retry.
            </Text>
          </View>
        ) : !featured ? (
          <View className="mt-10 items-center px-6">
            <Feather name="moon" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">Nothing booked tonight</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              {search.trim()
                ? 'No matches for your search.'
                : 'Check back soon — new shows get confirmed daily.'}
            </Text>
          </View>
        ) : (
          <>
            <Pressable
              onPress={() => router.push(`/event/${featured.id}`)}
              className="mt-5 h-[212px] justify-end overflow-hidden rounded-[22px] bg-night"
            >
              {featured.cover_image_url ? (
                <ImageBackground
                  source={{ uri: featured.cover_image_url }}
                  className="absolute inset-0"
                  resizeMode="cover"
                />
              ) : null}
              <Scrim />
              {featured.is_special ? (
                <View className="absolute left-3 top-3 self-start rounded-full bg-white/20 px-3 py-1.5">
                  <Text className="text-[11px] font-extrabold tracking-wide text-white">Featured</Text>
                </View>
              ) : null}
              <View className="absolute right-3 top-3 h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90">
                <Feather name="heart" size={16} color="#FF5A5F" />
              </View>
              <View className="p-4">
                <View className="flex-row items-center gap-1.5">
                  {isLive(featured.starts_at) ? (
                    <>
                      <View className="h-[15px] w-[15px] items-center justify-center rounded-full bg-white/35">
                        <View className="h-[7px] w-[7px] rounded-full bg-white" />
                      </View>
                      <Text className="text-[11px] font-extrabold tracking-wide text-white">LIVE NOW</Text>
                    </>
                  ) : (
                    <>
                      <View className="h-2 w-2 rounded-full bg-white" />
                      <Text className="text-[11px] font-extrabold tracking-wide text-white">TONIGHT</Text>
                    </>
                  )}
                </View>
                <Text className="mt-1.5 text-[23px] font-extrabold leading-tight text-white">
                  {featured.title}
                </Text>
                <Text className="mt-0.5 text-[13px] font-semibold text-white/90">
                  {featured.venue?.name ?? 'TBA'} · {timeLabel(featured.starts_at).time}{' '}
                  {timeLabel(featured.starts_at).ampm}
                </Text>
              </View>
            </Pressable>

            {rest.length > 0 ? (
              <>
                <View className="mt-6 flex-row items-center justify-between">
                  <Text className="text-[18px] font-extrabold text-ink-deep">Also tonight</Text>
                  <Text className="text-[13px] font-bold text-coral">See all</Text>
                </View>

                <View className="mt-3">
                  {rest.map((e, i) => {
                    const t = timeLabel(e.starts_at)
                    return (
                      <Pressable
                        key={e.id}
                        onPress={() => router.push(`/event/${e.id}`)}
                        className="mb-4 flex-row items-center gap-3"
                      >
                        <View
                          className="h-16 w-16 rounded-2xl"
                          style={{ backgroundColor: THUMBS[i % THUMBS.length] }}
                        />
                        <View className="flex-1">
                          <Text className="text-[15.5px] font-semibold text-ink" numberOfLines={1}>
                            {e.title}
                          </Text>
                          <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                            {e.venue?.name ?? 'TBA'}
                          </Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-[14px] font-extrabold text-ink-deep">{t.time}</Text>
                          <Text className="text-[11px] font-bold text-ink-mute">{t.ampm}</Text>
                        </View>
                      </Pressable>
                    )
                  })}
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
