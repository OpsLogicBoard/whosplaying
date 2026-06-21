import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useBand } from '@whosplaying/core'

type BandMemberArtist = {
  id: string
  stage_name?: string | null
  hero_image_url?: string | null
}

type BandMember = {
  artist: BandMemberArtist | null
}

function initialOf(name: string | null | undefined): string {
  return (name ?? '?').trim().charAt(0).toUpperCase() || '?'
}

export default function BandScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { data, isLoading, error } = useBand(id)

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
        <Header onBack={() => router.back()} />
        <View className="flex-1 items-center justify-center px-8">
          <Feather name={error ? 'wifi-off' : 'users'} size={28} color="#9AA1AC" />
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
  const members = (band.members ?? []).filter((m) => m?.artist)
  const meta = [band.home_city, (band.genres ?? []).join(' · ')].filter(Boolean).join(' · ')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <Header onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <View className="mt-2 h-56 justify-end overflow-hidden rounded-2xl bg-night p-4">
          <View className="flex-row items-center gap-1.5">
            <Feather name="users" size={13} color="#FFFFFF" />
            <Text className="text-[11px] font-extrabold tracking-wide text-white">BAND</Text>
          </View>
          <Text className="mt-1 text-[26px] font-extrabold leading-tight text-white">
            {band.name ?? 'Untitled band'}
          </Text>
          {meta ? (
            <Text className="mt-1 text-[12.5px] font-semibold text-white/80">{meta}</Text>
          ) : null}
        </View>

        {band.bio ? (
          <Text className="mt-6 text-[15px] leading-6 text-ink-slate">{band.bio}</Text>
        ) : null}

        <Text className="mt-7 text-[18px] font-extrabold text-ink-deep">Members</Text>
        {members.length === 0 ? (
          <Text className="mt-2 text-[13px] font-semibold text-ink-mute">
            No members listed yet.
          </Text>
        ) : (
          <View className="mt-3 gap-3">
            {members.map((m) => {
              const artist = m.artist as BandMemberArtist
              return (
                <Pressable
                  key={artist.id}
                  onPress={() => router.push(`/artist/${artist.id}`)}
                  className="flex-row items-center gap-3 rounded-xl border border-ink-line bg-surface p-4"
                >
                  <View className="h-11 w-11 items-center justify-center rounded-full bg-purple">
                    <Text className="text-[16px] font-extrabold text-white">
                      {initialOf(artist.stage_name)}
                    </Text>
                  </View>
                  <Text className="flex-1 text-[15px] font-bold text-ink">
                    {artist.stage_name ?? 'Unknown artist'}
                  </Text>
                  <Feather name="chevron-right" size={18} color="#9AA1AC" />
                </Pressable>
              )
            })}
          </View>
        )}
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
