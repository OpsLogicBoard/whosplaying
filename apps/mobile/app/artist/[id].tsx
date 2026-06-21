import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useArtist, useFollows } from '@whosplaying/core'
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
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name={error ? 'wifi-off' : 'user'} size={28} color="#9AA1AC" />
          <Text className="mt-3 text-center text-[15px] font-semibold text-ink-slate">
            {error ? 'Couldn’t load this artist.' : 'Artist not found.'}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  const initial = artist.stage_name.trim().charAt(0).toUpperCase() || '?'

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Header onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-2 items-center justify-end overflow-hidden rounded-2xl bg-night p-6">
          {artist.hero_image_url ? (
            <Image
              source={{ uri: artist.hero_image_url }}
              className="h-[88px] w-[88px] rounded-full"
            />
          ) : (
            <View className="h-[88px] w-[88px] items-center justify-center rounded-full bg-purple">
              <Text className="text-[32px] font-extrabold text-white">{initial}</Text>
            </View>
          )}
          <Text className="mt-3 text-center text-[26px] font-extrabold leading-tight text-white">
            {artist.stage_name}
          </Text>
          {artist.home_city ? (
            <View className="mt-1 flex-row items-center gap-1">
              <Feather name="map-pin" size={13} color="#9AA1AC" />
              <Text className="text-[12.5px] font-semibold text-white/70">{artist.home_city}</Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={toggleFollow}
          className={`mt-5 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 ${following ? 'bg-surface border border-ink-line' : 'bg-coral'}`}
        >
          <Feather name="heart" size={16} color={following ? '#FF5A5F' : '#FFFFFF'} />
          <Text className={`text-[15px] font-extrabold ${following ? 'text-ink' : 'text-white'}`}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </Pressable>

        {artist.genres.length > 0 ? (
          <View className="mt-5 flex-row flex-wrap gap-2">
            {artist.genres.map((g) => (
              <View key={g} className="rounded-full border border-ink-line bg-surface px-3 py-1.5">
                <Text className="text-[12.5px] font-bold text-ink-slate">{g}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {artist.bio ? (
          <Text className="mt-6 text-[15px] leading-6 text-ink-slate">{artist.bio}</Text>
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
