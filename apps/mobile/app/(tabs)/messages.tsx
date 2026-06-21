import { IconMessage2, IconSearch } from '@tabler/icons-react-native'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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

function convPreview(c: ConversationRow): string {
  if (c.event_id) return 'Tap to open the event thread'
  if (c.gig_listing_id) return 'Tap to open the gig thread'
  return 'Tap to open the conversation'
}

// Colored monogram avatar (mockup .favm) — deterministic tint from the title.
const MONOGRAM_TINTS = ['#2D7FF9', '#8B5CF6', '#FFB020', '#FF5A5F', '#0F6E56']

function monogram(title: string): string {
  const words = title.trim().split(/\s+/).filter(Boolean)
  const first = words[0]?.[0] ?? '?'
  const second = words[1]?.[0] ?? ''
  return (first + second).toUpperCase()
}

function tintFor(id: string): string {
  let sum = 0
  for (let i = 0; i < id.length; i += 1) sum += id.charCodeAt(i)
  return MONOGRAM_TINTS[sum % MONOGRAM_TINTS.length]!
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

  const rows = conversations.data ?? []

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
        {/* Top-level tab title (mockup .pad heading — no back chevron) */}
        <Text className="mb-3.5 text-[26px] font-extrabold tracking-tight text-ink-deep">Messages</Text>

        {/* Search bar */}
        <View className="mb-2 flex-row items-center gap-2 rounded-2xl border border-ink-line bg-surface px-4 py-3">
          <IconSearch size={16} color="#9AA1AC" strokeWidth={2} />
          <Text className="text-[14px] font-semibold text-ink-mute">
            Search messages, artists, venues
          </Text>
        </View>

        {conversations.isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : rows.length === 0 ? (
          <View className="mt-16 items-center px-6">
            <IconMessage2 size={28} color="#9AA1AC" strokeWidth={2} />
            <Text className="mt-3 text-[16px] font-extrabold text-ink-deep">No messages yet</Text>
            <Text className="mt-1 text-center text-[13px] font-semibold text-ink-slate">
              Conversations with venues and artists show up here once a booking gets going.
            </Text>
          </View>
        ) : (
          rows.map((c, i) => {
            const title = convTitle(c)
            const unread = i === 0 // no read-state backend yet; surface the freshest thread
            return (
              <Pressable
                key={c.id}
                onPress={() => router.push(`/messages/${c.id}`)}
                className="flex-row items-center gap-3 py-3"
              >
                <View
                  style={{ backgroundColor: tintFor(c.id) }}
                  className="h-[46px] w-[46px] items-center justify-center rounded-full"
                >
                  <Text className="text-[15px] font-extrabold text-white">{monogram(title)}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-extrabold text-ink-deep">{title}</Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate" numberOfLines={1}>
                    {convPreview(c)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[11px] font-bold text-ink-mute">
                    {relTime(c.last_message_at)}
                  </Text>
                  {unread ? <View className="mt-1.5 h-[9px] w-[9px] rounded-full bg-coral" /> : null}
                </View>
              </Pressable>
            )
          })
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
