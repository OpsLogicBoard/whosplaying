import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvent } from '@whosplaying/core'
import { billingQ } from '@whosplaying/supabase'
import { supabase } from '../../lib/supabase'

function whenLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: event, isLoading, error } = useEvent(id)

  async function onGetTickets() {
    if (!event?.ticket_url || !id) return
    // Always-free tap logged for the venue's views→taps funnel, then open with UTM.
    await billingQ.logTicketTap(supabase, id)
    Linking.openURL(billingQ.withTicketUtm(event.ticket_url, id))
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !event) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name={error ? 'wifi-off' : 'calendar'} size={28} color="#9AA1AC" />
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this event.' : 'This event isn’t available.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const venue = event.venue
  const isConfirmed = event.status === 'confirmed'

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Header onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-2 h-56 justify-end overflow-hidden rounded-2xl bg-night p-4">
          <View className="flex-row items-center gap-1.5">
            <View className={`h-2 w-2 rounded-full ${isConfirmed ? 'bg-lime' : 'bg-gold'}`} />
            <Text className="text-[11px] font-extrabold tracking-wide text-white">
              {isConfirmed ? 'CONFIRMED' : 'LINEUP CONFIRMING'}
            </Text>
          </View>
          <Text className="mt-1 text-[26px] font-extrabold leading-tight text-white">
            {event.title}
          </Text>
        </View>

        <View className="mt-5 gap-4">
          <Row icon="calendar" title={whenLabel(event.starts_at)} sub={timeLabel(event.starts_at)} />
          {venue ? (
            <Pressable onPress={() => router.push(`/venue/${venue.id}`)}>
              <Row
                icon="map-pin"
                title={venue.name}
                sub={[venue.address, venue.city, venue.region].filter(Boolean).join(', ')}
                chevron
              />
            </Pressable>
          ) : null}
        </View>

        {event.description ? (
          <Text className="mt-6 text-[15px] leading-6 text-ink-slate">{event.description}</Text>
        ) : null}

        {event.ticket_url ? (
          <Pressable
            onPress={onGetTickets}
            className="mt-7 flex-row items-center justify-center gap-2 rounded-2xl bg-coral py-4"
          >
            <Feather name="external-link" size={18} color="#FFFFFF" />
            <Text className="text-[15px] font-extrabold text-white">Get tickets</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View className="flex-row items-center px-5 pt-1">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
      >
        <Feather name="chevron-left" size={20} color="#071020" />
      </Pressable>
    </View>
  )
}

function Row({
  icon,
  title,
  sub,
  chevron,
}: {
  icon: keyof typeof Feather.glyphMap
  title: string
  sub?: string
  chevron?: boolean
}) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface border border-ink-line">
        <Feather name={icon} size={18} color="#5C6470" />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-bold text-ink">{title}</Text>
        {sub ? <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{sub}</Text> : null}
      </View>
      {chevron ? <Feather name="chevron-right" size={18} color="#9AA1AC" /> : null}
    </View>
  )
}
