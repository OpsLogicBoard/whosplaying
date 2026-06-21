import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useHostedEvents } from '@whosplaying/core'
import { useAuth } from '../../lib/auth'

function whenLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function BookingsScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const { events, ownsVenue, isLoading, error } = useHostedEvents(session?.user?.id)

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Your <Text className="text-coral">shows.</Text>
        </Text>
        <Text className="mt-1 text-[13px] font-semibold text-ink-slate">
          Upcoming shows at your venues. Both sides confirm the lineup.
        </Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-12 items-center px-6">
            <Feather name="wifi-off" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load your shows. Pull to retry.
            </Text>
          </View>
        ) : !ownsVenue ? (
          <View className="mt-12 items-center px-6">
            <Feather name="home" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No venue yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Claim your venue to post shows and manage bookings.
            </Text>
          </View>
        ) : events.length === 0 ? (
          <View className="mt-12 items-center px-6">
            <Feather name="calendar" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No upcoming shows</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Post an event to start booking performers.
            </Text>
          </View>
        ) : (
          <View className="mt-6">
            {events.map((e) => {
              const confirmed = e.status === 'confirmed'
              return (
                <Pressable
                  key={e.id}
                  onPress={() => router.push(`/event/${e.id}`)}
                  className="mb-3 rounded-xl border border-ink-line bg-surface p-4"
                >
                  <View className="flex-row items-center gap-2">
                    <View className={`h-2 w-2 rounded-full ${confirmed ? 'bg-lime' : 'bg-gold'}`} />
                    <Text className="text-[11px] font-extrabold uppercase tracking-wide text-ink-slate">
                      {confirmed ? 'Confirmed' : 'Lineup confirming'}
                    </Text>
                  </View>
                  <Text className="mt-1.5 text-[16px] font-extrabold text-ink-deep" numberOfLines={1}>
                    {e.title}
                  </Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                    {e.venue?.name ?? 'Your venue'} · {whenLabel(e.starts_at)} · {timeLabel(e.starts_at)}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
