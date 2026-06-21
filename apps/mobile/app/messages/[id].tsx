import { Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMessages } from '@whosplaying/core'
import { BackHeader } from '../../components/ui'
import { useAuth } from '../../lib/auth'

function timeLabel(iso: string): string {
  const d = new Date(iso)
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export default function ThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const { messages, isLoading, send, sending } = useMessages(id, userId)
  const [draft, setDraft] = useState('')

  async function onSend() {
    const body = draft.trim()
    if (!body) return
    setDraft('')
    await send(body)
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Conversation" onBack={() => router.back()} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 py-4">
            {messages.length === 0 ? (
              <View className="mt-16 items-center px-6">
                <Feather name="message-square" size={26} color="#9AA1AC" />
                <Text className="mt-3 text-center text-[13px] font-semibold text-ink-slate">
                  No messages yet — say hello.
                </Text>
              </View>
            ) : (
              messages.map((m) => {
                const mine = m.sender_user_id === userId
                return (
                  <View key={m.id} className={`mb-2.5 max-w-[80%] ${mine ? 'self-end' : 'self-start'}`}>
                    <View className={`rounded-2xl px-3.5 py-2.5 ${mine ? 'bg-coral' : 'bg-surface border border-ink-line'}`}>
                      <Text className={`text-[14px] ${mine ? 'text-white' : 'text-ink'}`}>{m.body}</Text>
                    </View>
                    <Text className={`mt-1 text-[10px] font-semibold text-ink-mute ${mine ? 'text-right' : ''}`}>
                      {timeLabel(m.created_at)}
                    </Text>
                  </View>
                )
              })
            )}
          </ScrollView>
        )}

        <View className="flex-row items-center gap-2 border-t border-ink-line bg-surface px-4 py-3 pb-6">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor="#9AA1AC"
            className="flex-1 rounded-full border border-ink-line bg-canvas px-4 py-2.5 text-[14px] text-ink"
            multiline
          />
          <Pressable
            onPress={onSend}
            disabled={sending || !draft.trim()}
            className="h-10 w-10 items-center justify-center rounded-full bg-coral"
            style={{ opacity: sending || !draft.trim() ? 0.5 : 1 }}
          >
            <Feather name="send" size={17} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
