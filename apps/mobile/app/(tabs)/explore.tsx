import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvents } from '@whosplaying/core'

const THUMBS = ['#FFB020', '#B7F34A', '#FF3F73', '#2D7FF9', '#8B5CF6', '#1D9E75']

function startOfDay(d: Date) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}

function timeLabel(iso: string): { time: string; ampm: string } {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return { time: `${h}:${m.toString().padStart(2, '0')}`, ampm }
}

export default function ExploreScreen() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [offset, setOffset] = useState(0) // days from today

  // Build the next 7 days from today for the selector.
  const today = useMemo(() => startOfDay(new Date()), [])
  const days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        return {
          offset: i,
          label: date.toLocaleDateString(undefined, { weekday: 'short' }),
          num: date.getDate().toString(),
          date,
        }
      }),
    [today],
  )

  const selected = days[offset] ?? days[0]!
  const from = startOfDay(selected.date)
  const to = useMemo(() => {
    const t = new Date(from)
    t.setHours(23, 59, 59, 999)
    return t
  }, [from])

  const { data: events, isLoading, error, refetch, isRefetching } = useEvents({
    from,
    to,
    status: 'confirmed',
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return events
    return events.filter(
      (e) => e.title.toLowerCase().includes(q) || (e.venue?.name ?? '').toLowerCase().includes(q),
    )
  }, [events, search])

  const heading = selected.date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-5 pb-10 pt-2"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF5A5F" />
        }
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2.5 pr-4"
        >
          {days.map((day) => {
            const on = day.offset === offset
            return (
              <Pressable
                key={day.offset}
                onPress={() => setOffset(day.offset)}
                className={`w-[52px] items-center rounded-xl py-2.5 ${on ? 'bg-coral' : ''}`}
              >
                <Text className={`text-[11px] font-bold uppercase ${on ? 'text-white' : 'text-ink-mute'}`}>
                  {day.label}
                </Text>
                <Text className={`mt-0.5 text-[18px] font-extrabold ${on ? 'text-white' : 'text-ink'}`}>
                  {day.num}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

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

        <Text className="mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
          {heading}
        </Text>

        {isLoading ? (
          <View className="mt-14 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-12 items-center px-6">
            <Feather name="wifi-off" size={26} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load shows. Pull to retry.
            </Text>
          </View>
        ) : filtered.length === 0 ? (
          <View className="mt-12 items-center px-6">
            <Feather name="calendar" size={26} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              {search.trim() ? 'No matches for your search.' : 'No shows scheduled this day.'}
            </Text>
          </View>
        ) : (
          <View className="mt-3">
            {filtered.map((e, i) => {
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
                    <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
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
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
