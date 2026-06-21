import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFollows, useHostedEvents } from '@whosplaying/core'
import { CORAL_GRADIENT, GradientButton, HatCard, Segmented } from '../../components/ui'
import { useAppMode } from '../../lib/appMode'
import { useAuth } from '../../lib/auth'
import { supabase } from '../../lib/supabase'

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// Work-mode dashboard cards. Subtitles describe the feature (not fabricated
// metrics) so the screen stays honest on live data; each routes to its screen.
const WORK_HATS: {
  icon: keyof typeof Feather.glyphMap
  tint: string
  color: string
  title: string
  sub: string
  route: string
}[] = [
  { icon: 'calendar', tint: '#FFF1F1', color: '#FF5A5F', title: 'Calendar & gigs', sub: 'Your shows & lineup confirmation', route: '/bookings' },
  { icon: 'mic', tint: '#E6F1FB', color: '#2D7FF9', title: 'Open gigs & bids', sub: 'Post slots · review bids', route: '/gig-board' },
  { icon: 'message-square', tint: '#EEEDFE', color: '#8B5CF6', title: 'Messages', sub: 'Conversations with venues & artists', route: '/messages' },
  { icon: 'mail', tint: '#FAEEDA', color: '#854F0B', title: 'Invites to play', sub: 'Venues inviting you to book', route: '/invites' },
  { icon: 'user', tint: '#EEF3FF', color: '#2D7FF9', title: 'Public profile', sub: 'What fans see on events, map & search', route: '/public-profile' },
  { icon: 'users', tint: '#EDFBF4', color: '#0F6E56', title: 'My people', sub: 'Followers & collaborators', route: '/my-people' },
  { icon: 'tag', tint: '#FFF1F1', color: '#FF5A5F', title: 'Offers & promos', sub: 'Deals on event pages & nearby (GPS)', route: '/offers' },
  { icon: 'image', tint: '#FFF7E6', color: '#FFB020', title: 'Promote a gig', sub: 'One show or your month → Canva, Instagram', route: '/promote' },
  { icon: 'bar-chart-2', tint: '#E6F1FB', color: '#2D7FF9', title: 'Analytics', sub: 'Views, Get Tickets taps & follower growth', route: '/analytics' },
  { icon: 'zap', tint: '#FFF7E6', color: '#FFB020', title: 'Boost a show', sub: 'Top of Tonight & the map · reach more fans', route: '/boost' },
  { icon: 'map-pin', tint: '#FFF1F1', color: '#FF5A5F', title: 'Push to nearby fans', sub: 'Alert goers in range — capped & mutable', route: '/gps-push' },
]

export default function YouScreen() {
  const { mode, setMode } = useAppMode()
  const router = useRouter()
  const { session } = useAuth()
  const userId = session?.user?.id
  const email = session?.user?.email ?? ''

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
  const city = profile?.home_city?.trim() || null
  const followCount = useFollows(userId).data.length
  const { events: hosted, ownsVenue } = useHostedEvents(userId)

  // The user's owned venue (acting-as entity) + real work counts.
  const work = useQuery({
    queryKey: ['work-summary', userId ?? null],
    enabled: !!userId && mode === 'manage',
    queryFn: async () => {
      const { data: venues } = await supabase
        .from('venues')
        .select('id, name, city')
        .eq('owner_user_id', userId as string)
        .limit(1)
      const venue = ((venues ?? []) as { id: string; name: string; city: string | null }[])[0] ?? null
      if (!venue) return { venue: null, openGigs: 0, bids: 0 }
      const { data: gigs } = await supabase
        .from('gig_listings')
        .select('id')
        .eq('venue_id', venue.id)
        .eq('status', 'open')
      const gigIds = ((gigs ?? []) as { id: string }[]).map((g) => g.id)
      let bids = 0
      if (gigIds.length) {
        const { count } = await supabase
          .from('gig_bids')
          .select('id', { count: 'exact', head: true })
          .in('gig_listing_id', gigIds)
        bids = count ?? 0
      }
      return { venue, openGigs: gigIds.length, bids }
    },
  })

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-5 pb-10 pt-4">
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
            {city ? (
              <View className="mt-0.5 flex-row items-center gap-1">
                <Feather name="map-pin" size={12} color="#9AA1AC" />
                <Text className="text-[12.5px] font-bold text-ink-mute">{city}</Text>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push('/edit-profile')}
            className="h-9 w-9 items-center justify-center rounded-full border border-ink-line bg-surface"
          >
            <Feather name="edit-2" size={16} color="#5C6470" />
          </Pressable>
        </View>

        {/* Work / Play master switch */}
        <View className="mt-5">
          <Segmented
            value={mode === 'manage' ? 'work' : 'play'}
            onChange={(v) => setMode(v === 'work' ? 'manage' : 'play')}
            options={[
              { value: 'play', label: 'Play' },
              { value: 'work', label: 'Work' },
            ]}
          />
          <View className="mt-1.5 flex-row items-start gap-1.5 px-0.5">
            <Feather name={mode === 'manage' ? 'briefcase' : 'eye'} size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
            <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
              {mode === 'manage'
                ? 'Managing your gigs and venues. Switch to Play to browse shows as a fan.'
                : "You're browsing as a fan. Switch to Work to manage your gigs, calendar, and venues."}
            </Text>
          </View>
        </View>

        {mode === 'play' ? (
          /* ===== FAN VIEW ===== */
          <>
            <Pressable
              onPress={() => router.push('/suggested-follows')}
              className="mt-4 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-[15px]"
            >
              <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-coral-soft">
                <Feather name="user-plus" size={20} color="#FF5A5F" />
              </View>
              <View className="flex-1">
                <Text className="text-[15px] font-extrabold text-ink">Find people you follow</Text>
                <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">
                  From Instagram &amp; Facebook — follow them in the app
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9AA1AC" />
            </Pressable>

            <View className="mt-4 flex-row rounded-2xl border border-ink-line bg-surface py-3.5 shadow-card">
              <Pressable onPress={() => router.push('/saved')} className="flex-1 items-center border-r border-ink-line">
                <Text className="text-[19px] font-extrabold text-ink">{followCount}</Text>
                <Text className="text-[11.5px] font-bold text-ink-slate">Following</Text>
              </Pressable>
              <Pressable onPress={() => router.push('/saved')} className="flex-1 items-center">
                <Text className="text-[19px] font-extrabold text-ink">{hosted.length}</Text>
                <Text className="text-[11.5px] font-bold text-ink-slate">Saved shows</Text>
              </Pressable>
            </View>
            <View className="mt-3 flex-row items-start gap-1.5 px-0.5">
              <Feather name="heart" size={13} color="#9AA1AC" style={{ marginTop: 1 }} />
              <Text className="flex-1 text-[11.5px] font-semibold leading-5 text-ink-mute">
                Who you follow lives in the <Text className="font-extrabold text-ink-slate">Saved</Text> tab.
              </Text>
            </View>

            {/* Upgrade nudge (no pro profile yet) */}
            {!ownsVenue ? (
              <View className="mt-5 overflow-hidden rounded-[18px] bg-ink-deep p-[18px]">
                <View className="mb-2 flex-row items-center gap-1.5">
                  <Feather name="zap" size={12} color="#FFB020" />
                  <Text className="text-[10.5px] font-extrabold uppercase tracking-wide text-gold">For artists &amp; venues</Text>
                </View>
                <Text className="text-[17px] font-extrabold text-white">Perform or host shows?</Text>
                <Text className="mb-3.5 mt-1.5 text-[12.5px] font-semibold leading-5 text-white/70">
                  Turn on a professional profile to post gigs, accept invites, and manage your calendar — same account,
                  you keep your follows and saves.
                </Text>
                <View className="self-start">
                  <GradientButton label="Set up a pro profile" icon="briefcase" size="md" onPress={() => setMode('manage')} />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          /* ===== WORK DASHBOARD ===== */
          <>
            <Text className="mb-3 mt-5 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Acting as</Text>
            {ownsVenue && work.data?.venue ? (
              <View className="rounded-[18px] border border-ink-line bg-surface p-1.5 shadow-card">
                <View className="flex-row items-center gap-3 p-2.5">
                  <View className="h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-blue">
                    <Text className="text-[16px] font-extrabold text-white">{initials(work.data.venue.name)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-[10px] font-extrabold uppercase tracking-wide text-ink-mute">Venue</Text>
                    <Text className="text-[16px] font-extrabold text-ink">{work.data.venue.name}</Text>
                    {work.data.venue.city ? (
                      <Text className="mt-0.5 text-[12px] font-semibold text-ink-slate">{work.data.venue.city}</Text>
                    ) : null}
                  </View>
                  <Feather name="chevron-down" size={18} color="#9AA1AC" />
                </View>
              </View>
            ) : (
              <View className="rounded-[18px] border border-ink-line bg-surface p-4">
                <Text className="text-[15px] font-extrabold text-ink">No pro profile yet</Text>
                <Text className="mt-1 text-[12.5px] font-semibold leading-5 text-ink-slate">
                  Create an artist profile or claim your venue to post shows, manage a calendar, and build a public page
                  fans can find.
                </Text>
                <View className="mt-3 flex-row gap-2.5">
                  <Pressable
                    onPress={() => router.push('/create-artist')}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-ink-line bg-surface py-3"
                  >
                    <Feather name="mic" size={15} color="#8B5CF6" />
                    <Text className="text-[13px] font-extrabold text-ink">Artist</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push('/create-event')}
                    className="flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-ink-line bg-surface py-3"
                  >
                    <Feather name="home" size={15} color="#2D7FF9" />
                    <Text className="text-[13px] font-extrabold text-ink">Venue</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* Mini stats (real counts) */}
            <View className="mt-4 flex-row gap-2.5">
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">{hosted.length}</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Upcoming</Text>
              </View>
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">{work.data?.openGigs ?? 0}</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Open slots</Text>
              </View>
              <View className="flex-1 items-center rounded-[14px] border border-ink-line bg-surface py-3 shadow-card">
                <Text className="text-[18px] font-extrabold text-ink">{work.data?.bids ?? 0}</Text>
                <Text className="text-[10.5px] font-bold text-ink-slate">Bids</Text>
              </View>
            </View>

            <View className="mb-4 mt-1">
              <GradientButton label="Create event" icon="plus" onPress={() => router.push('/create-event')} />
            </View>

            {WORK_HATS.map((h) => (
              <HatCard
                key={h.title}
                icon={h.icon}
                tint={h.tint}
                color={h.color}
                title={h.title}
                sub={h.sub}
                onPress={() => router.push(h.route as never)}
              />
            ))}

            {/* Plan card */}
            <Text className="mb-3 mt-3 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Plan</Text>
            <Pressable onPress={() => router.push('/plan')} className="overflow-hidden rounded-[18px] bg-ink-deep p-[17px]">
              <View className="flex-row items-center gap-3">
                <View className="h-[42px] w-[42px] items-center justify-center rounded-xl bg-white/10">
                  <Feather name="zap" size={21} color="#FFB020" />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-bold text-white/60">You're on Free</Text>
                  <Text className="text-[16px] font-extrabold text-white">Unlock Venue Pro</Text>
                </View>
                <View className="flex-row items-center gap-1 rounded-full bg-gold px-2 py-1">
                  <Feather name="anchor" size={10} color="#071020" />
                  <Text className="text-[9.5px] font-extrabold uppercase tracking-wide text-ink-deep">Founding</Text>
                </View>
              </View>
              <Text className="my-3 text-[12.5px] font-semibold leading-5 text-white/70">
                Unlimited offers, event boosts, GPS push to nearby fans, full analytics &amp; featured placement —{' '}
                <Text className="font-extrabold text-white">$14.99/mo</Text> locked for life as a founding Beaches venue.
              </Text>
              <GradientButton label="See Venue Pro" icon="zap" size="md" onPress={() => router.push('/plan')} />
            </Pressable>
          </>
        )}

        {/* ===== Preferences (shared) ===== */}
        <Text className="mb-1 mt-6 text-[13px] font-extrabold uppercase tracking-wide text-ink-slate">Preferences</Text>
        <SettingRow icon="link" label="Connections" onPress={() => router.push('/connections')} />
        <SettingRow icon="bell" label="Notifications & alerts" />
        <SettingRow icon="grid" label="Share my profile (QR)" />
        {mode === 'manage' ? (
          <SettingRow icon="credit-card" label="Plan & billing" onPress={() => router.push('/billing')} />
        ) : null}
        <SettingRow icon="shield" label="Account & privacy" />
        <SettingRow icon="help-circle" label="Help & feedback" />
        <Pressable onPress={signOut} className="flex-row items-center gap-3 py-3.5">
          <Feather name="log-out" size={19} color="#FF5A5F" style={{ width: 24, textAlign: 'center' }} />
          <Text className="text-[14.5px] font-bold text-coral">Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

function SettingRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap
  label: string
  onPress?: () => void
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center gap-3 border-b border-ink-line py-3.5">
      <Feather name={icon} size={19} color="#5C6470" style={{ width: 24, textAlign: 'center' }} />
      <Text className="flex-1 text-[14.5px] font-semibold text-ink">{label}</Text>
      <Feather name="chevron-right" size={18} color="#9AA1AC" />
    </Pressable>
  )
}
