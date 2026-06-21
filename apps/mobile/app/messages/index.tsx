import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader } from '../../components/ui'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

type ConversationRow = {
  id: string
  event_id: string | null
  gig_listing_id: string | null
  last_message_at: string
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return 'now'
  if (m < 60) return `${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h`
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short' })
}

function convTitle(c: ConversationRow): string {
  if (c.event_id) return 'Event chat'
  if (c.gig_listing_id) return 'Gig chat'
  return 'Direct message'
}

export default function MessagesScreen() {
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id

  const conversations = useQuery({
    queryKey: ['conversations', userId ?? null],
    enabled: !!userId,
    queryFn: async (): Promise<ConversationRow[]> => {
      const { data, error } = await supabase
        .from('conversation_participants')
        .select('conversation:conversations(id, event_id, gig_listing_id, last_message_at)')
        .eq('user_id', userId as string)
      if (error) throw error
      const rows = ((data ?? []) as unknown as { conversation: ConversationRow | null }[])
        .map((r) => r.conversation)
        .filter((c): c is ConversationRow => !!c)
      return rows.sort((a, b) => b.last_message_at.localeCompare(a.last_message_at))
    },
  })

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Messages" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-3">
        {conversations.isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : (conversations.data ?? []).length === 0 ? (
          <View className="mt-16 items-center px-6">
            <Feather name="message-square" size={28} color="#9AA1AC" />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No messages yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Conversations with venues and artists show up here once a booking gets going.
            </Text>
          </View>
        ) : (
          (conversations.data ?? []).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => router.push(`/messages/${c.id}`)}
              className="flex-row items-center gap-3 border-b border-ink-line py-3"
            >
              <View className="h-[46px] w-[46px] items-center justify-center rounded-full bg-blue">
                <Feather name="message-circle" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-semibold text-ink">{convTitle(c)}</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">Tap to open the thread</Text>
              </View>
              <Text className="text-[11px] font-bold text-ink-mute">{relTime(c.last_message_at)}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
