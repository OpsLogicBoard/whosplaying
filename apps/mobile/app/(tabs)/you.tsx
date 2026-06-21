import {
  IconAnchor,
  IconBell,
  IconBolt,
  IconBrandInstagram,
  IconBriefcase,
  IconChartLine,
  IconChevronRight,
  IconCreditCard,
  IconDiscount,
  IconEye,
  IconHeart,
  IconHelpCircle,
  IconIdBadge2,
  IconLogout,
  IconMailOpened,
  IconMapPin,
  IconMapPinBolt,
  IconPencil,
  IconPlugConnected,
  IconQrcode,
  IconRocket,
  IconSelector,
  IconShieldLock,
  IconSparkles,
  IconTemplate,
  IconUserPlus,
  IconUsersGroup,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFollows, useHostedEvents } from '@whosplaying/core'
import { CORAL_GRADIENT, GradientButton, HatCard, Segmented } from '../../components/ui'
import { resolvePersona, useAppMode } from '../../lib/appMode'
import { useAuth } from '../../lib/auth'
import { useActiveProEntity } from '../../lib/proProfiles'
import { supabase } from '../../lib/supabase'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// Work-mode dashboard cards (mockup .hat rows, prototype.html 667-725) in exact
// order, with coral badges where the mockup shows them.
const WORK_HATS: {
  icon: TablerIcon
  tint: string
  color: string
  title: string
  sub: string
  route: string
  badge?: number
}[] = [
  // Calendar / Gigs / Create / Messages live in the Work tab bar — not duplicated here.
  { icon: IconMailOpened, tint: '#FAEEDA', color: '#854F0B', title: 'Invites to play', sub: '2 venues want to book The Tide', route: '/invites', badge: 2 },
  { icon: IconIdBadge2, tint: '#EEF3FF', color: '#2D7FF9', title: 'Public profile', sub: 'What fans see on events, map & search', route: '/public-profile' },
  { icon: IconUsersGroup, tint: '#EDFBF4', color: '#0F6E56', title: 'My people', sub: 'Followers & collaborators', route: '/my-people' },
  { icon: IconDiscount, tint: '#FFF1F1', color: '#FF5A5F', title: 'Offers & promos', sub: 'Deals on event pages & nearby (GPS)', route: '/offers' },
  { icon: IconTemplate, tint: '#FFF7E6', color: '#FFB020', title: 'Promote a gig', sub: 'One show or your month → Canva, Instagram', route: '/promote' },
  { icon: IconChartLine, tint: '#E6F1FB', color: '#2D7FF9', title: 'Analytics', sub: 'Views, Get Tickets taps & follower growth', route: '/analytics' },
  { icon: IconRocket, tint: '#FFF7E6', color: '#FFB020', title: 'Boost a show', sub: 'Top of Tonight & the map · reach more fans', route: '/boost' },
  { icon: IconMapPinBolt, tint: '#FFF1F1', color: '#FF5A5F', title: 'Push to nearby fans', sub: 'Alert goers in range — capped & mutable', route: '/gps-push' },
]

// Fan-view taste tags (mockup .pf-tags, prototype.html 627-631).
const TASTE_TAGS = ['Roots rock', 'Indie', 'Funk', 'Country', 'Singer-songwriter']

export default function YouScreen() {
  const { mode, setMode, personaOverride, setPersona } = useAppMode()
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const email = session?.user?.email ?? ''
  const { entity: actingAs } = useActiveProEntity()

  const { data: profile } = useQuery({
    queryKey: ['profile', userId ?? null],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, home_city, avatar_url')
        .eq('id', userId as string)
        .single()
      if (error) throw error
      return data as { display_name: string | null; home_city: string | null; avatar_url: string | null }
    },
  })

  const name = profile?.display_name?.trim() || email.split('@')[0] || 'You'
  const handle = '@' + (email.split('@')[0] || 'you')
  const city = profile?.home_city?.trim() || 'Jacksonville Beach, FL'
  const followCount = useFollows(userId).data.length
  const { events: hosted, ownsVenue } = useHostedEvents(userId)

  // Persona: pro if they own a pro entity (derived) OR opted in via the upgrade
  // card. Mode (play/work) only applies to pros; the master switch is hidden
  // for goers, who are always in Play.
  const persona = resolvePersona(personaOverride, ownsVenue)
  const isPro = persona === 'pro'
  const isWork = isPro && mode === 'work'

  async function signOut() {
    await supabase.auth.signOut()
  }

  // Open access: a logged-out visitor browses freely. The You tab is where we
  // invite (never force) them to sign in to personalize.
  if (!userId) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
          <Text className="mb-1 text-[28px] font-extrabold tracking-tight text-ink-deep">You</Text>
          <Text className="mb-6 text-[14px] font-semibold text-ink-slate">
            Browse everything as a guest. Sign in to make it yours.
          </Text>

          <View className="items-center rounded-[20px] border border-ink-line bg-surface px-5 py-7 shadow-card">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-coral-soft">
              <IconHeart size={26} color="#FF5A5F" strokeWidth={2.2} />
            </View>
            <Text className="mt-4 text-center text-[17px] font-extrabold text-ink-deep">
              Save shows, follow artists & venues
            </Text>
            <Text className="mt-1.5 text-center text-[13px] font-semibold leading-5 text-ink-slate">
              Get alerts when the people you follow play, sync saved shows to your
              calendar, and set your taste — or set up a pro profile to post gigs.
            </Text>
            <View className="mt-5 w-full">
              <GradientButton
                label="Sign in or create account"
                icon={IconUserPlus}
                onPress={() => router.push('/(auth)/login')}
              />
            </View>
          </View>

          <Text className="mb-3 mt-7 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
            Preferences
          </Text>
          <SettingRow icon={IconBell} label="Notifications & alerts" />
          <SettingRow icon={IconShieldLock} label="Account & privacy" />
          <SettingRow icon={IconHelpCircle} label="Help & feedback" />
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
        {/* Professional banner — pros only */}
        {isPro ? (
          <View className="mb-4 flex-row items-center gap-2 rounded-xl bg-ink-deep px-3.5 py-3">
            <IconBriefcase size={16} color="#FFB020" strokeWidth={2.2} />
            <Text className="text-[13px] font-extrabold tracking-[0.2px] text-white">Professional Profile</Text>
          </View>
        ) : null}

        {/* Identity */}
        <View className="flex-row items-center gap-3.5">
          <LinearGradient
            colors={CORAL_GRADIENT}
            locations={[0, 0.48, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: 64, width: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text className="text-[22px] font-extrabold text-white">{initials(name)}</Text>
          </LinearGradient>
          <View className="flex-1">
            <Text className="text-[21px] font-extrabold text-ink-deep" numberOfLines={1}>
              {name}
            </Text>
            <Text className="text-[13px] font-bold text-ink-slate">{handle}</Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              <IconMapPin size={13} color="#9AA1AC" />
              <Text className="text-[12.5px] font-bold text-ink-mute">{city}</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="h-9 w-9 items-center justify-center rounded-full border border-ink-line bg-surface"
          >
            <IconPencil size={16} color="#5C6470" />
          </Pressable>
        </View>

        {/* Source chip — pros only */}
        {isPro ? (
          <View className="mt-2.5 flex-row items-center gap-1.5">
            <IconBrandInstagram size={13} color="#9AA1AC" />
            <Text className="text-[11.5px] font-semibold text-ink-mute">Profile imported from Instagram</Text>
          </View>
        ) : null}

        {/* Work / Play master switch — pros only */}
        {isPro ? (
          <View className="mt-5">
            <Segmented
              value={mode === 'work' ? 'work' : 'play'}
              onChange={(v) => setMode(v === 'work' ? 'work' : 'play')}
              options={[
                { value: 'play', label: 'Play' },
                { value: 'work', label: 'Work' },
              ]}
            />
            <View className="mt-1.5 flex-row items-start gap-1.5 px-0.5">
              {isWork ? (
                <IconBriefcase size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
              ) : (
                <IconEye size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
              )}
              <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
                {isWork
                  ? 'Managing your gigs and venues. Switch to Play to browse shows as a fan.'
                  : "You're browsing as a fan. Switch to Work to manage your gigs, calendar, and venues."}
              </Text>
            </View>
          </View>
        ) : null}

        {!isWork ? (
          /* ===== FAN VIEW (goers + pros in Play) ===== */
          <>
            <Pressable
              onPress={() => router.push('/suggested-follows')}
              className="mt-4 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-[15px]"
            >
              <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-coral-soft">
                <IconUserPlus size={20} color="#FF5A5F" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-ink">12 people you follow are here</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                  From Instagram &amp; Facebook — follow them in the app
                </Text>
              </View>
              <IconChevronRight size={18} color="#9AA1AC" />
            </Pressable>

            <View className="mt-4 flex-row rounded-2xl border border-ink-line bg-surface py-3.5 shadow-card">
              <Pressable onPress={() => router.push('/saved')} className="flex-1 items-center border-r border-ink-line">
                <Text className="text-[19px] font-extrabold text-ink">{hosted.length || 8}</Text>
                <Text className="text-[11.5px] font-bold text-ink-slate">Saved shows</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/saved')} className="flex-1 items-center">
                <Text className="text-[19px] font-extrabold text-ink">{followCount || 3}</Text>
                <Text className="text-[11.5px] font-bold text-ink-slate">Going</Text>
              </Pressable>
            </View>
            <View className="mt-3 flex-row items-start gap-1.5 px-0.5">
              <IconHeart size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
                Who you follow lives in the <Text className="font-extrabold text-ink-slate">Saved</Text> tab.
              </Text>
            </View>

            {/* Your taste */}
            <View className="mb-2.5 mt-6 flex-row items-center justify-between">
              <Text className="text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Your taste</Text>
              <Text className="text-[12.5px] font-extrabold text-coral">Edit</Text>
            </View>
            <View className="flex-row flex-wrap gap-2">
              {TASTE_TAGS.map((t) => (
                <View key={t} className="rounded-full border border-ink-line bg-surface px-3 py-1.5">
                  <Text className="text-[12.5px] font-bold text-ink-slate">{t}</Text>
                </View>
              ))}
            </View>

            {/* Upgrade nudge — goers only */}
            {!isPro ? (
              <View className="mt-5 overflow-hidden rounded-[18px] bg-ink-deep p-[18px]">
                <View className="mb-2 flex-row items-center gap-1.5">
                  <IconSparkles size={12} color="#FFB020" />
                  <Text className="text-[10.5px] font-extrabold uppercase tracking-wide text-gold">
                    For artists &amp; venues
                  </Text>
                </View>
                <Text className="text-[17px] font-extrabold text-white">Perform or host shows?</Text>
                <Text className="mb-3.5 mt-1.5 text-[12.5px] font-semibold leading-5 text-white/70">
                  Turn on a professional profile to post gigs, accept invites, and manage your calendar — same account,
                  you keep your follows and saves.
                </Text>
                <View className="self-start">
                  <GradientButton
                    label="Set up a pro profile"
                    icon={IconBriefcase}
                    size="md"
                    onPress={() => {
                      setPersona('pro')
                      setMode('work')
                    }}
                  />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          /* ===== WORK DASHBOARD (pros in Work) ===== */
          <>
            <Text className="mb-3 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">
              Acting as
            </Text>
            <Pressable
              onPress={() => router.push('/profiles')}
              className="rounded-[18px] border border-ink-line bg-surface p-1.5 shadow-card"
            >
              <View className="flex-row items-center gap-3 p-2.5">
                <View
                  className="h-[46px] w-[46px] items-center justify-center rounded-[13px]"
                  style={{ backgroundColor: actingAs?.color ?? '#2D7FF9' }}
                >
                  <Text className="text-[16px] font-extrabold text-white">{actingAs?.initials ?? 'SB'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">
                    {actingAs?.kind ?? 'Venue'}
                  </Text>
                  <Text className="text-[16px] font-extrabold text-ink">{actingAs?.name ?? 'Surfer the Bar'}</Text>
                  <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">
                    {actingAs?.sub ?? 'Jacksonville Beach · you + 3 staff'}
                  </Text>
                </View>
                <IconSelector size={18} color="#9AA1AC" />
              </View>
            </Pressable>

            {/* Mini stats */}
            <View className="mt-4 flex-row gap-2.5">
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">4</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Upcoming</Text>
              </View>
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">2</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Open slots</Text>
              </View>
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">3</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Bids</Text>
              </View>
            </View>

            <View className="mt-4">
              {WORK_HATS.map((h) => (
                <HatCard
                  key={h.title}
                  icon={h.icon}
                  tint={h.tint}
                  color={h.color}
                  title={h.title}
                  sub={h.sub}
                  badge={h.badge}
                  onPress={() => router.push(h.route as never)}
                />
              ))}
            </View>

            {/* Plan card */}
            <Text className="mb-3 mt-3 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Plan</Text>
            <Pressable onPress={() => router.push('/plan')} className="overflow-hidden rounded-[18px] bg-ink-deep p-[17px]">
              <View className="flex-row items-center gap-3">
                <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/10">
                  <IconBolt size={21} color="#FFB020" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-white/60">You're on Free</Text>
                  <Text className="text-[16px] font-extrabold text-white">Unlock Venue Pro</Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-gold px-2 py-1">
                  <IconAnchor size={10} color="#071020" />
                  <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-ink-deep">Founding</Text>
                </View>
              </View>
              <Text className="my-3 text-[12.5px] font-semibold leading-5 text-white/70">
                Unlimited offers, event boosts, GPS push to nearby fans, full analytics &amp; featured placement —{' '}
                <Text className="font-extrabold text-white">$14.99/mo</Text> locked for life as a founding Beaches venue.
              </Text>
              <GradientButton label="See Venue Pro" icon={IconSparkles} size="md" onPress={() => router.push('/plan')} />
            </Pressable>
          </>
        )}

        {/* ===== Preferences (shared) ===== */}
        <Text className="mb-1 mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Preferences</Text>
        <SettingRow icon={IconPlugConnected} label="Connections" onPress={() => router.push('/connections')} />
        <SettingRow icon={IconBell} label="Notifications & alerts" />
        {isPro ? <SettingRow icon={IconQrcode} label="Share my profile (QR)" /> : null}
        {isWork ? (
          <SettingRow icon={IconCreditCard} label="Plan & billing" onPress={() => router.push('/billing')} />
        ) : null}
        <SettingRow icon={IconShieldLock} label="Account & privacy" />
        <SettingRow icon={IconHelpCircle} label="Help & feedback" />
        <Pressable onPress={signOut} className="flex-row items-center gap-3 py-3.5">
          <View className="w-6 items-center">
            <IconLogout size={19} color="#FF5A5F" />
          </View>
          <Text className="text-[14.5px] font-bold text-coral">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingRow({
  icon: Icon,
  label,
  onPress,
}: {
  icon: TablerIcon
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
      <View className="w-6 items-center">
        <Icon size={19} color="#5C6470" />
      </View>
      <Text className="flex-1 text-[14.5px] font-semibold text-ink">{label}</Text>
      <IconChevronRight size={18} color="#9AA1AC" />
    </Pressable>
  )
}
