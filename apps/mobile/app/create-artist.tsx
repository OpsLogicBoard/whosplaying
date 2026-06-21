import { IconChevronLeft } from '@tabler/icons-react-native'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { artistsQ } from '@whosplaying/supabase'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return `${base || 'artist'}-${Date.now().toString(36).slice(-4)}`
}

export default function CreateArtistScreen() {
  const router = useRouter()
  const qc = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user?.id

  const [stageName, setStageName] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [genresText, setGenresText] = useState('')
  const [bio, setBio] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = stageName.trim().length > 0 && !!userId && !submitting

  async function submit() {
    if (!userId || !canSubmit) return
    setSubmitting(true)
    try {
      const genres = genresText
        .split(',')
        .map((g) => g.trim())
        .filter(Boolean)
      const { data, error } = await artistsQ.createArtist(supabase, {
        owner_user_id: userId,
        stage_name: stageName.trim(),
        slug: slugify(stageName),
        home_city: homeCity.trim() || null,
        bio: bio.trim() || null,
        genres,
      })
      if (error) throw error
      await qc.invalidateQueries({ queryKey: ['my-artist', userId] })
      const newId = (data as { id: string } | null)?.id
      if (newId) router.replace(`/artist/${newId}`)
      else router.back()
    } catch (e) {
      Alert.alert('Couldn’t create profile', e instanceof Error ? e.message : 'Please try again.')
      setSubmitting(false)
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
          Artist <Text className="text-coral">profile.</Text>
        </Text>
        <Text className="mt-1 text-[13px] font-semibold text-ink-slate">
          Get discovered — solo or with your bands.
        </Text>

        <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
          Stage name
        </Text>
        <TextInput
          value={stageName}
          onChangeText={setStageName}
          placeholder="e.g. The Tide Walkers"
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
          Genres
        </Text>
        <TextInput
          value={genresText}
          onChangeText={setGenresText}
          placeholder="Rock, Indie, Surf (comma separated)"
          placeholderTextColor="#9AA1AC"
          autoCapitalize="words"
          className="mt-2 rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
        />

        <Text className="mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
          Bio
        </Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="A line about your sound"
          placeholderTextColor="#9AA1AC"
          multiline
          className="mt-2 min-h-[88px] rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
          textAlignVertical="top"
        />

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          className={`mt-8 items-center justify-center rounded-2xl py-4 ${canSubmit ? 'bg-coral' : 'bg-coral/40'}`}
        >
          <Text className="text-[15px] font-extrabold text-white">
            {submitting ? 'Creating…' : 'Create profile'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
