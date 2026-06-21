import { IconChevronLeft, IconUser, IconWifiOff } from '@tabler/icons-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useArtist, useFollows } from '@whosplaying/core'
import { PublicProfileView } from '../../components/public-profile-view'
import { useAuth } from '../../lib/auth'

export default function ArtistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data: artist, isLoading, error } = useArtist(id)
  const { session } = useAuth()
  const follows = useFollows(session?.user?.id)
  const following = id ? follows.isFollowing('artist', id) : false
  const toggleFollow = () => {
    if (!id) return
    if (following) follows.unfollow('artist', id)
    else follows.follow('artist', id)
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !artist) {
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
          {error ? <IconWifiOff size={28} color="#9AA1AC" /> : <IconUser size={28} color="#9AA1AC" />}
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this artist.' : 'Artist not found.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const byline = [artist.genres.join(' · '), artist.home_city].filter(Boolean).join(' · ') || null

  return (
    <PublicProfileView
      roleLabel="Artist"
      heroColor="#23272F"
      logoColor="#8B5CF6"
      initials={artist.stage_name.trim().slice(0, 2).toUpperCase() || '?'}
      name={artist.stage_name}
      byline={byline}
      genres={artist.genres}
      about={artist.bio}
      showListen
      following={following}
      onBack={() => router.back()}
      onToggleFollow={toggleFollow}
      onMessage={() => {}}
      onOpenShow={(showId) => router.push(`/event/${showId}`)}
    />
  )
}
