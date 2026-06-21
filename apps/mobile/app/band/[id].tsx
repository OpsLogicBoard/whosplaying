import { IconChevronLeft, IconUsers, IconWifiOff } from '@tabler/icons-react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBand, useFollows } from '@whosplaying/core'
import { PublicProfileView, type PublicMember } from '../../components/public-profile-view'
import { useAuth } from '../../lib/auth'

type BandMemberArtist = { id: string; stage_name?: string | null }
type BandMember = { artist: BandMemberArtist | null; instrument?: string | null }

export default function BandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, error } = useBand(id)
  const { session } = useAuth()
  const follows = useFollows(session?.user?.id)
  const following = id ? follows.isFollowing('band', id) : false
  const toggleFollow = () => {
    if (!id) return
    if (following) follows.unfollow('band', id)
    else follows.follow('band', id)
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator color="#FF5A5F" />
      </SafeAreaView>
    )
  }

  if (error || !data) {
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
          {error ? <IconWifiOff size={28} color="#9AA1AC" /> : <IconUsers size={28} color="#9AA1AC" />}
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this band.' : 'Band not found.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const band = data as {
    name?: string | null
    bio?: string | null
    home_city?: string | null
    genres?: string[] | null
    members?: BandMember[] | null
  }
  const members: PublicMember[] = (band.members ?? [])
    .filter((m) => m?.artist)
    .map((m) => ({
      id: (m.artist as BandMemberArtist).id,
      name: (m.artist as BandMemberArtist).stage_name ?? 'Unknown artist',
      instrument: m.instrument ?? null,
    }))
  const name = band.name ?? 'Untitled band'
  const byline = [(band.genres ?? []).join(' · '), band.home_city].filter(Boolean).join(' · ') || null

  return (
    <PublicProfileView
      roleLabel="Band"
      heroColor="#2D7FF9"
      logoColor="#8B5CF6"
      initials={name.trim().slice(0, 2).toUpperCase() || '?'}
      name={name}
      byline={byline}
      genres={band.genres ?? []}
      about={band.bio}
      members={members}
      showListen
      following={following}
      onBack={() => router.back()}
      onToggleFollow={toggleFollow}
      onMessage={() => {}}
      onOpenShow={(showId) => router.push(`/event/${showId}`)}
      onOpenMember={(artistId) => router.push(`/artist/${artistId}`)}
    />
  )
}
