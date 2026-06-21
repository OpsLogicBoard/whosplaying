import { Feather } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton, Segmented } from '../components/ui'

// Public profile editor (mockup pubprof). This is the design surface for the
// page fans see on events, the map, and search. Per-entity persistence runs
// through the dedicated create flows (e.g. create-artist); a unified editor is
// pending, so Save surfaces that.
export default function PublicProfileScreen() {
  const router = useRouter()
  const [role, setRole] = useState<'band' | 'venue' | 'promoter'>('band')
  const [name, setName] = useState('')
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Public profile" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        <View className="mb-4 flex-row items-center gap-2.5 rounded-xl bg-ink-deep px-3.5 py-3">
          <Feather name="eye" size={16} color="#FFB020" />
          <Text className="flex-1 text-[13px] font-extrabold text-white">
            This is how fans find you — on event pages, the map pin & search.
          </Text>
        </View>

        <Text className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">Profile type</Text>
        <Segmented
          value={role}
          onChange={setRole}
          options={[
            { value: 'band', label: 'Band' },
            { value: 'venue', label: 'Venue' },
            { value: 'promoter', label: 'Promoter' },
          ]}
        />

        <Field label="Display name" value={name} onChange={setName} placeholder="e.g. The Tide" />
        <Field
          label="Tagline"
          value={tagline}
          onChange={setTagline}
          placeholder="Indie surf-rock from Jax Beach"
        />
        <Text className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          placeholder="A few lines about your sound or your room…"
          placeholderTextColor="#9AA1AC"
          className="min-h-[88px] rounded-2xl border border-ink-line bg-surface p-3.5 text-[15px] text-ink"
          textAlignVertical="top"
        />

        <Text className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">Based in</Text>
        <View className="flex-row items-center gap-2 rounded-2xl border border-ink-line bg-surface px-4 py-3.5">
          <Feather name="map-pin" size={16} color="#FF5A5F" />
          <Text className="text-[15px] font-semibold text-ink-slate">Jacksonville Beach, FL</Text>
        </View>

        <View className="mt-6">
          <GradientButton
            label="Save"
            icon="check"
            onPress={() =>
              Alert.alert('Public profile', 'Saving the public page — unified editor wiring in progress.')
            }
          />
        </View>
        <Pressable
          onPress={() => Alert.alert('Preview', 'Public page preview — wiring in progress.')}
          className="mt-2.5 flex-row items-center justify-center gap-2 rounded-[15px] border border-ink-line bg-surface py-3.5"
        >
          <Feather name="eye" size={16} color="#111318" />
          <Text className="text-[15px] font-extrabold text-ink">Preview public page</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <>
      <Text className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9AA1AC"
        className="rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
      />
    </>
  )
}
