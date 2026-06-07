import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Wordmark } from '@whosplaying/ui'
import { supabase } from '../../lib/supabase'

const REDIRECT = 'whosplaying://auth/callback'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function send() {
    if (!email || sending) return
    setSending(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT, shouldCreateUser: true },
    })
    setSending(false)
    if (error) {
      Alert.alert("Couldn't send", error.message)
      return
    }
    setSent(true)
  }

  return (
    <SafeAreaView className="flex-1 bg-teal-50">
      <View className="flex-1 items-center justify-center p-6">
        <Wordmark width={260} />
        {!sent ? (
          <>
            <Text className="mt-8 text-ink-soft text-center text-lg">
              Sign in with a magic link to your email.
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-6 w-full max-w-sm bg-paper border border-ink-line rounded-lg px-4 py-3 text-ink"
            />
            <Pressable
              onPress={send}
              disabled={!email || sending}
              className="mt-4 w-full max-w-sm bg-coral px-6 py-3 rounded-lg disabled:opacity-50"
            >
              <Text className="text-white text-center font-semibold text-lg">
                {sending ? 'Sending…' : 'Send magic link'}
              </Text>
            </Pressable>
          </>
        ) : (
          <View className="mt-8 items-center">
            <Text className="font-display text-2xl text-ink">Check your inbox</Text>
            <Text className="text-ink-soft text-center mt-2">
              Tap the link in your email to sign in. Make sure you tap it on this device.
            </Text>
            <Pressable onPress={() => setSent(false)} className="mt-6">
              <Text className="text-teal underline">Use a different email</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
