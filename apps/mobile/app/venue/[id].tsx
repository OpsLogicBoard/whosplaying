import { IconChevronLeft, IconMapPin, IconWifiOff } from '@tabler/icons-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useEvents, useFollows, useVenue } from '@whosplaying/core'
import { PublicProfileView, type PublicShow } from '../../components/public-profile-view'
import { useAuth } from '../../lib/auth'

export default function VenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: venue, isLoading, error } = useVenue(id)
  const from = useMemo(() => new Date(), [])
  const { data: events } = useEvents({ venueId: id, from, status: 'confirmed' })
  const { session } = useAuth()
  const follows = useFollows(session?.user?.id)
  const following = id ? follows.isFollowing('venue', id) : false
  const toggleFollow = () => {
    if (!id) return
    if (following) follows.unfollow('venue', id)
    else follows.follow('venue', id)
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !venue) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <View className="flex-row items-center px-5 pt-1">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
          >
            <IconChevronLeft size={20} color="#071020" />
          </Pressable>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          {error ? <IconWifiOff size={28} color="#9AA1AC" /> : <IconMapPin size={28} color="#9AA1AC" />}
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this venue.' : 'Venue not found.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const cityRegion = [venue.city, venue.region].filter(Boolean).join(', ')
  const shows: PublicShow[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    city: cityRegion || null,
    starts_at: e.starts_at,
  }))

  return (
    <PublicProfileView
      roleLabel="Venue"
      heroColor="#1D9E75"
      logoColor="#2D7FF9"
      initials={venue.name.trim().slice(0, 2).toUpperCase() || '?'}
      name={venue.name}
      byline={cityRegion || null}
      verified={venue.is_verified}
      about={venue.description}
      shows={shows}
      following={following}
      onBack={() => router.back()}
      onToggleFollow={toggleFollow}
      onMessage={() => {}}
      onOpenShow={(showId) => router.push(`/event/${showId}`)}
    />
  )
}
