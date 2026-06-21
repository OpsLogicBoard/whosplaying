import { Feather } from '@expo/vector-icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { eventsQ } from '@whosplaying/supabase'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const HOURS = [17, 18, 19, 20, 21, 22, 23] // 5 PM – 11 PM

function hourLabel(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hr = h % 12 || 12
  return `${hr} ${ampm}`
}

function startOfDay(d: Date) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}

export default function CreateEventScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data: venue, isLoading: venueLoading } = useQuery({
    queryKey: ['my-first-venue', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name')
        .eq('owner_user_id', userId as string)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as { id: string; name: string } | null
    },
  })

  const today = useMemo(() => startOfDay(new Date()), [])
  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        return {
          offset: i,
          weekday: date.toLocaleDateString(undefined, { weekday: 'short' }),
          num: date.getDate().toString(),
          date,
        }
      }),
    [today],
  )

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [ticketUrl, setTicketUrl] = useState('')
  const [dayOffset, setDayOffset] = useState(0)
  const [hour, setHour] = useState(20)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = !!venue && title.trim().length > 0 && !submitting

  async function submit() {
    if (!venue || !userId || !canSubmit) return
    setSubmitting(true)
    try {
      const day = days[dayOffset]?.date ?? today
      const startsAt = new Date(day)
      startsAt.setHours(hour, 0, 0, 0)
      const { error } = await eventsQ.createEvent(supabase, {
        venue_id: venue.id,
        title: title.trim(),
        starts_at: startsAt.toISOString(),
        created_by: userId,
        description: description.trim() || null,
        ticket_url: ticketUrl.trim() || null,
      })
      if (error) throw error
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['events'] }),
        qc.invalidateQueries({ queryKey: ['hosted-events'] }),
      ])
      router.replace('/bookings')
    } catch (e) {
      Alert.alert('Couldn’t post the show', e instanceof Error ? e.message : 'Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-row items-center px-5 pt-1">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
        >
          <Feather name="chevron-left" size={20} color="#071020" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-12">
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Post a <Text className="text-coral">show.</Text>
        </Text>

        {venueLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : !venue ? (
          <View className="mt-12 items-center px-6">
            <Feather name="home" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue before posting shows.
            </Text>
          </View>
        ) : (
          <>
            <Text className="mt-1 text-[13px] font-semibold text-ink-slate">at {venue.name}</Text>

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Friday Night Live"
              placeholderTextColor="#9AA1AC"
              className="mt-2 rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
            />

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Date
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerClassName="gap-2.5 pr-4 mt-2"
            >
              {days.map((d) => {
                const on = d.offset === dayOffset
                return (
                  <Pressable
                    key={d.offset}
                    onPress={() => setDayOffset(d.offset)}
                    className={`w-[52px] items-center rounded-xl py-2.5 ${on ? 'bg-coral' : 'border border-ink-line bg-surface'}`}
                  >
                    <Text className={`text-[11px] font-bold uppercase ${on ? 'text-white' : 'text-ink-mute'}`}>
                      {d.weekday}
                    </Text>
                    <Text className={`mt-0.5 text-[18px] font-extrabold ${on ? 'text-white' : 'text-ink'}`}>
                      {d.num}
                    </Text>
                  </Pressable>
                )
              })}
            </ScrollView>

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Start time
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {HOURS.map((h) => {
                const on = h === hour
                return (
                  <Pressable
                    key={h}
                    onPress={() => setHour(h)}
                    className={`rounded-full px-4 py-2 ${on ? 'bg-coral' : 'border border-ink-line bg-surface'}`}
                  >
                    <Text className={`text-[13px] font-bold ${on ? 'text-white' : 'text-ink-slate'}`}>
                      {hourLabel(h)}
                    </Text>
                  </Pressable>
                )
              })}
            </View>

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Who’s playing, the vibe, cover…"
              placeholderTextColor="#9AA1AC"
              multiline
              className="mt-2 min-h-[88px] rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
              textAlignVertical="top"
            />

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Ticket link (optional)
            </Text>
            <TextInput
              value={ticketUrl}
              onChangeText={setTicketUrl}
              placeholder="https://…"
              placeholderTextColor="#9AA1AC"
              autoCapitalize="none"
              keyboardType="url"
              className="mt-2 rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
            />

            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              className={`mt-8 flex-row items-center justify-center gap-2 rounded-2xl py-4 ${canSubmit ? 'bg-coral' : 'bg-coral/40'}`}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text className="text-[15px] font-extrabold text-white">
                {submitting ? 'Posting…' : 'Post show'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
