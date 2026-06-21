import { IconChevronLeft } from '@tabler/icons-react-native'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

export default function EditProfileScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, home_city, bio')
        .eq('id', userId as string)
        .single()
      if (error) throw error
      return data as { display_name: string | null; home_city: string | null; bio: string | null }
    },
  })

  const [displayName, setDisplayName] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (profile && !hydrated) {
      setDisplayName(profile.display_name ?? '')
      setHomeCity(profile.home_city ?? '')
      setBio(profile.bio ?? '')
      setHydrated(true)
    }
  }, [profile, hydrated])

  const canSave = displayName.trim().length > 0 && !saving

  async function save() {
    if (!userId || !canSave) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          home_city: homeCity.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('id', userId)
      if (error) throw error
      await qc.invalidateQueries({ queryKey: ['profile', userId] })
      router.back()
    } catch (e) {
      Alert.alert('Couldn’t save', e instanceof Error ? e.message : 'Please try again.')
      setSaving(false)
    }
  }

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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-12">
        <Text className="mt-3 text-[33px] font-extrabold text-ink-deep">
          Edit <Text className="text-coral">profile.</Text>
        </Text>

        {isLoading ? (
          <View className="mt-16 items-center">
            <ActivityIndicator color="#FF5A5F" />
          </View>
        ) : (
          <>
            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Display name
            </Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Your name"
              placeholderTextColor="#9AA1AC"
              className="mt-2 rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
            />

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Home city
            </Text>
            <TextInput
              value={homeCity}
              onChangeText={setHomeCity}
              placeholder="e.g. Jacksonville Beach"
              placeholderTextColor="#9AA1AC"
              className="mt-2 rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
            />

            <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Bio
            </Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="A line about you"
              placeholderTextColor="#9AA1AC"
              multiline
              className="mt-2 min-h-[88px] rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
              textAlignVertical="top"
            />

            <Pressable
              onPress={save}
              disabled={!canSave}
              className={`mt-8 items-center justify-center rounded-2xl py-4 ${canSave ? 'bg-coral' : 'bg-coral/40'}`}
            >
              <Text className="text-[15px] font-extrabold text-white">
                {saving ? 'Saving…' : 'Save profile'}
              </Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
