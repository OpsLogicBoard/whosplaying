import {
  IconBrandApple,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandSpotify,
  IconCamera,
  IconCheck,
  IconEye,
  IconMapPin,
  IconPhoto,
  IconPlus,
  IconShare,
} from '@tabler/icons-react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { BackHeader, GradientButton, Segmented, Toggle } from '../components/ui'

type Role = 'band' | 'venue' | 'promoter'

const GALLERY = ['#2D7FF9', '#8B5CF6', '#FFB020']

const MEMBERS = [
  { initials: 'JW', color: '#FF5A5F', name: 'James Warner', sub: 'Guitar & vocals', status: 'Linked' as const },
  { initials: 'RB', color: '#FFB020', name: 'Rosa Bel', sub: 'Fiddle', status: 'Linked' as const },
  { initials: 'EH', color: '#EEF0F4', name: 'Eli Hart', sub: 'Bass', status: 'Pending' as const },
]

export default function PublicProfileScreen() {
  const router = useRouter()
  const [role, setRole] = useState<Role>('band')
  const [name, setName] = useState('The Tide')
  const [tagline, setTagline] = useState('Indie surf-rock from Jax Beach')
  const [bio, setBio] = useState(
    'Four-piece indie surf-rock band born on the First Coast — reverb-soaked guitars, big harmonies, and a live show that fills the floor.',
  )
  const [socialOn, setSocialOn] = useState(true)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <BackHeader title="Public profile" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-2">
        {/* Scope card */}
        <View className="mb-4 flex-row items-center gap-3 rounded-[14px] border border-ink-line bg-surface p-3 shadow-card">
          <View className="h-10 w-10 items-center justify-center rounded-[11px] bg-purple">
            <Text className="text-[14px] font-extrabold text-white">{name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Public page for</Text>
            <Text className="text-[14.5px] font-extrabold text-ink">{name}</Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <Text className="text-[12.5px] font-extrabold text-coral">Change</Text>
          </Pressable>
        </View>

        <FLabel>Profile type</FLabel>
        <Segmented
          value={role}
          onChange={setRole}
          options={[
            { value: 'band', label: 'Band' },
            { value: 'venue', label: 'Venue' },
            { value: 'promoter', label: 'Promoter' },
          ]}
        />

        {/* Photo / logo */}
        <FLabel>Profile photo / logo</FLabel>
        <View className="flex-row items-center gap-3">
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-purple">
            <Text className="text-[20px] font-extrabold text-white">{name.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[13.5px] font-bold text-ink">Avatar &amp; logo</Text>
            <Text className="mt-0.5 text-[12px] font-semibold text-ink-mute">
              Shown across the app and on event listings
            </Text>
          </View>
          <Pressable className="rounded-xl border border-ink-line bg-surface px-4 py-2.5">
            <Text className="text-[13px] font-extrabold text-ink">Change</Text>
          </Pressable>
        </View>

        {/* Cover */}
        <FLabel>Cover photo</FLabel>
        <View className="h-28 justify-between overflow-hidden rounded-2xl bg-blue p-3">
          <Pressable className="h-9 w-9 items-center justify-center self-end rounded-full bg-white/90">
            <IconCamera size={17} color="#071020" />
          </Pressable>
          <View className="flex-row items-center gap-1.5 self-start rounded-full bg-black/25 px-2.5 py-1">
            <IconPhoto size={12} color="#FFFFFF" />
            <Text className="text-[11px] font-extrabold text-white">Wallpaper for your events</Text>
          </View>
        </View>
        <Hint>Used as the background on your event listings and the top of this profile.</Hint>

        <FLabel>Display name</FLabel>
        <TextInput
          value={name}
          onChangeText={setName}
          className="rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
        />
        <FLabel>Tagline</FLabel>
        <TextInput
          value={tagline}
          onChangeText={setTagline}
          className="rounded-2xl border border-ink-line bg-surface px-4 py-3 text-[15px] text-ink"
        />
        <FLabel>Bio</FLabel>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          className="min-h-[92px] rounded-2xl border border-ink-line bg-surface p-3.5 text-[15px] leading-6 text-ink"
          textAlignVertical="top"
        />

        <FLabel>Genres / tags</FLabel>
        <TagRow tags={['Indie', 'Surf rock', 'Dream pop']} />

        <FLabel>Based in</FLabel>
        <View className="flex-row items-center gap-2 rounded-2xl border border-ink-line bg-surface px-4 py-3.5">
          <IconMapPin size={16} color="#FF5A5F" />
          <Text className="text-[15px] font-semibold text-ink">Jacksonville Beach, FL</Text>
        </View>

        {/* Venue-only */}
        {role === 'venue' ? (
          <>
            <FLabel>Address</FLabel>
            <FBox>200 1st St N · Jacksonville Beach, FL</FBox>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <FLabel>Capacity</FLabel>
                <FBox>250</FBox>
              </View>
              <View className="flex-1">
                <FLabel>Venue type</FLabel>
                <FBox>Bar · live music</FBox>
              </View>
            </View>
            <FLabel>Amenities</FLabel>
            <TagRow tags={['Full bar', 'Stage + PA', 'Patio']} />
          </>
        ) : null}

        {/* Promoter-only */}
        {role === 'promoter' ? (
          <>
            <FLabel>What you present</FLabel>
            <FBox>Indie &amp; roots showcases across the Beaches</FBox>
          </>
        ) : null}

        {/* Listen — band/artist only */}
        {role === 'band' ? (
          <>
            <View className="mb-2 mt-4 flex-row items-center gap-2">
              <Text className="text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">Listen links</Text>
              <Text className="text-[11px] font-semibold text-ink-mute">from Music connections</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <LinkChip icon={IconBrandSpotify} color="#1DB954" label="Spotify" />
              <LinkChip icon={IconBrandApple} label="Apple Music" off />
              <LinkChip icon={IconPlus} label="Add" off />
            </View>
            <Hint>Add more under Settings → Music.</Hint>
          </>
        ) : null}

        {/* Social links toggle */}
        <FLabel>Social links</FLabel>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center gap-2">
            <IconShare size={16} color="#FF5A5F" />
            <Text className="text-[14px] font-semibold text-ink">Show my social links on this profile</Text>
          </View>
          <Toggle on={socialOn} onToggle={() => setSocialOn((v) => !v)} />
        </View>
        <Hint>Fans can tap through to your Instagram, Facebook &amp; TikTok.</Hint>

        {/* Photos */}
        <FLabel>Photos</FLabel>
        <View className="flex-row gap-2">
          {GALLERY.map((c) => (
            <View key={c} className="h-20 flex-1 rounded-xl" style={{ backgroundColor: c }} />
          ))}
          <Pressable className="h-20 flex-1 items-center justify-center rounded-xl border border-dashed border-ink-mute">
            <IconPlus size={20} color="#9AA1AC" />
          </Pressable>
        </View>

        {/* Members — band only */}
        {role === 'band' ? (
          <>
            <FLabel>Members</FLabel>
            <Hint>
              Link each member's Who's Playing profile so they appear on the band page and can manage shows.
            </Hint>
            {MEMBERS.map((m) => (
              <View key={m.name} className="flex-row items-center gap-3 border-b border-ink-line py-3">
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-full"
                  style={{ backgroundColor: m.color }}
                >
                  <Text
                    className="text-[15px] font-extrabold"
                    style={{ color: m.status === 'Pending' ? '#5C6470' : '#FFFFFF' }}
                  >
                    {m.initials}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-semibold text-ink">{m.name}</Text>
                  <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{m.sub}</Text>
                </View>
                <View
                  className="rounded-full px-2.5 py-1"
                  style={{ backgroundColor: m.status === 'Pending' ? '#FAEEDA' : '#E1F5EE' }}
                >
                  <Text
                    className="text-[10px] font-extrabold uppercase tracking-wide"
                    style={{ color: m.status === 'Pending' ? '#854F0B' : '#0F6E56' }}
                  >
                    {m.status}
                  </Text>
                </View>
              </View>
            ))}
            <Pressable className="mt-1 flex-row items-center gap-3 py-3">
              <View className="h-[46px] w-[46px] items-center justify-center rounded-full border border-dashed border-ink-mute bg-surface">
                <IconPlus size={20} color="#5C6470" />
              </View>
              <Text className="text-[15px] font-extrabold text-ink">Add member &amp; link profile</Text>
            </Pressable>
          </>
        ) : null}

        {/* Announce */}
        <FLabel>Tell your followers</FLabel>
        <Hint>Let your social followers know they can catch your shows on Who's Playing.</Hint>
        <View className="flex-row flex-wrap gap-2">
          <LinkChip icon={IconBrandInstagram} label="Announce on Instagram" />
          <LinkChip icon={IconBrandFacebook} color="#1877F2" label="Share to Facebook" />
        </View>

        {/* Info callout */}
        <View className="mt-4 flex-row items-start gap-2 rounded-2xl bg-[#E6F1FB] p-3">
          <IconEye size={17} color="#185FA5" style={{ marginTop: 1 }} />
          <Text className="flex-1 text-[12.5px] font-semibold leading-5 text-[#185FA5]">
            This profile is how fans find you — it appears on your event pages, map pin, and search results.
          </Text>
        </View>

        <View className="mt-4">
          <GradientButton
            label="Save"
            icon={IconCheck}
            onPress={() => Alert.alert('Public profile', 'Saving the public page — unified editor wiring in progress.')}
          />
        </View>
        <Pressable
          onPress={() => Alert.alert('Preview', 'Public page preview — wiring in progress.')}
          className="mt-2.5 flex-row items-center justify-center gap-2 rounded-[15px] border border-ink-line bg-surface py-3.5"
        >
          <IconEye size={16} color="#111318" />
          <Text className="text-[15px] font-extrabold text-ink">Preview public page</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function FLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2 mt-4 text-[12px] font-extrabold uppercase tracking-wide text-ink-slate">{children}</Text>
  )
}

function Hint({ children }: { children: string }) {
  return <Text className="mt-1.5 px-1 text-[12px] font-semibold leading-5 text-ink-mute">{children}</Text>
}

function FBox({ children }: { children: string }) {
  return (
    <View className="rounded-2xl border border-ink-line bg-surface px-4 py-3.5">
      <Text className="text-[15px] font-semibold text-ink">{children}</Text>
    </View>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {tags.map((t) => (
        <View key={t} className="rounded-full border border-ink-line bg-surface px-3 py-1.5">
          <Text className="text-[12.5px] font-bold text-ink-slate">{t}</Text>
        </View>
      ))}
      <View className="flex-row items-center rounded-full border border-dashed border-ink-mute px-3 py-1.5">
        <Text className="text-[12.5px] font-bold text-ink-mute">+ Add</Text>
      </View>
    </View>
  )
}

function LinkChip({
  icon: Icon,
  color,
  label,
  off,
}: {
  icon: typeof IconPlus
  color?: string
  label: string
  off?: boolean
}) {
  return (
    <View
      className={`flex-row items-center gap-2 rounded-full border px-3.5 py-2 ${off ? 'border-dashed border-ink-mute' : 'border-ink-line bg-surface'}`}
    >
      <Icon size={16} color={off ? '#9AA1AC' : (color ?? '#071020')} />
      <Text className={`text-[13px] font-bold ${off ? 'text-ink-mute' : 'text-ink'}`}>{label}</Text>
    </View>
  )
}
