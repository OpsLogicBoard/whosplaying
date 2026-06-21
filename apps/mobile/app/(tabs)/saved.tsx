import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useMemo } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFollows, type Follow } from '@whosplaying/core'
import { useAuth } from '../../lib/auth'

type TargetType = Follow['target_type']

const TYPE_META: Record<TargetType, { label: string; icon: keyof typeof Feather.glyphMap; color: string; route: string }> = {
  venue: { label: 'Venues', icon: 'home', color: '#1D9E75', route: 'venue' },
  artist: { label: 'Artists', icon: 'mic', color: '#2D7FF9', route: 'artist' },
  band: { label: 'Bands', icon: 'users', color: '#8B5CF6', route: 'band' },
}

const SECTION_ORDER: TargetType[] = ['venue', 'artist', 'band']

export default function SavedScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { data: follows, isLoading, error } = useFollows(userId)

  const sections = useMemo(() => {
    return SECTION_ORDER.map((type) => ({
      type,
      meta: TYPE_META[type],
      items: follows.filter((f) => f.target_type === type),
    })).filter((s) => s.items.length > 0)
  }, [follows])

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10">
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          <Text className="text-coral">Saved.</Text>
        </Text>
        <Text className="mt-1 text-[13px] font-semibold text-ink-slate">
          Venues, artists, and bands you follow.
        </Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : error ? (
          <View className="mt-10 items-center px-6">
            <Feather name="wifi-off" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-center text-[14px] font-semibold text-ink-slate">
              Couldn’t load your saved list. Pull to retry.
            </Text>
          </View>
        ) : sections.length === 0 ? (
          <View className="mt-10 items-center px-6">
            <Feather name="bookmark" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">Nothing saved yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Follow venues and artists to see them here.
            </Text>
          </View>
        ) : (
          sections.map((section) => (
            <View key={section.type} className="mt-6">
              <Text className="text-[18px] font-extrabold text-ink-deep">{section.meta.label}</Text>
              <View className="mt-2">
                {section.items.map((f) => (
                  <Pressable
                    key={`${f.target_type}-${f.target_id}`}
                    onPress={() => {
                      const id = f.target_id
                      if (f.target_type === 'venue') router.push(`/venue/${id}`)
                      else if (f.target_type === 'artist') router.push(`/artist/${id}`)
                      else router.push(`/band/${id}`)
                    }}
                    className="flex-row items-center gap-3 border-b border-ink-line py-3"
                  >
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: section.meta.color }}
                    >
                      <Feather name={section.meta.icon} size={20} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                        {f.target_id}
                      </Text>
                      <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate capitalize">
                        {f.target_type}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#9AA1AC" />
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
