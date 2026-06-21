import { useState } from 'react'
import { View, Text, TextInput, Pressable, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { Wordmark } from '@whosplaying/ui'
import { GradientButton } from '../../components/ui'
import { supabase } from '../../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

const REDIRECT = 'whosplaying://auth/callback'

export default function LoginScreen() {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function continueWithGoogle() {
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: REDIRECT, skipBrowserRedirect: true },
      })
      if (error) throw error
      if (!data?.url) throw new Error('No OAuth URL returned')
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT)
      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url)
        const params = parsed.queryParams ?? {}
        const access_token = (params.access_token as string) || undefined
        const refresh_token = (params.refresh_token as string) || undefined
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token })
        }
      }
    } catch (e) {
      Alert.alert("Sign-in failed", (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function submitEmail() {
    if (!email || !password || busy) return
    setBusy(true)
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: REDIRECT },
        })
        if (error) throw error
        Alert.alert('Check your email', 'Confirm your address, then sign in.')
        setMode('sign-in')
      }
    } catch (e) {
      Alert.alert("Couldn't sign in", (e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center p-6">
        <Wordmark width={260} />

        <View className="mt-8 w-full max-w-sm">
          <Pressable
            onPress={continueWithGoogle}
            disabled={busy}
            className="flex-row items-center justify-center gap-3 bg-white border border-ink-line rounded-2xl py-4 disabled:opacity-50"
          >
            <Text className="text-2xl">G</Text>
            <Text className="text-ink font-bold text-lg">Continue with Google</Text>
          </Pressable>

          <View className="flex-row items-center gap-3 my-5">
            <View className="flex-1 h-px bg-ink-line" />
            <Text className="text-ink-mute text-xs">or</Text>
            <View className="flex-1 h-px bg-ink-line" />
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholder="you@example.com"
            placeholderTextColor="#9AA1AC"
            className="bg-white border border-ink-line rounded-2xl px-4 py-4 text-ink"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            placeholder={mode === 'sign-up' ? 'Password (8+ characters)' : 'Password'}
            placeholderTextColor="#9AA1AC"
            className="mt-3 bg-white border border-ink-line rounded-2xl px-4 py-4 text-ink"
          />
          <View className="mt-4">
            <GradientButton
              label={busy ? '…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
              onPress={submitEmail}
              disabled={!email || !password || busy}
            />
          </View>

          <Pressable
            onPress={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
            className="mt-5"
          >
            <Text className="text-coral text-center font-bold">
              {mode === 'sign-in' ? 'Need an account? Create one' : 'Already have an account? Sign in'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}
