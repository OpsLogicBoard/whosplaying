// Rich public "goer view" profile shared by artist / band / venue screens
// (mockup #pubview, prototype.html 1520-1586). Full-bleed hero with role chip,
// circular logo badge and nav (back/share/message/heart); section stack
// (Genres, About, Upcoming shows, Find us live, Photos, Members, Listen,
// Social); sticky Follow / Message bottom bar.

import {
  IconArrowRight,
  IconBrandBandcamp,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandSpotify,
  IconBrandTiktok,
  IconBrandYoutube,
  IconChevronLeft,
  IconChevronRight,
  IconCircleCheckFilled,
  IconHeart,
  IconHeartFilled,
  IconMessage2,
  IconPlus,
  IconShare,
  type Icon as TablerIcon,
} from '@tabler/icons-react-native'
import { Pressable, ScrollView, Share, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Scrim } from './ui'

export type PublicShow = {
  id: string
  title: string
  city?: string | null
  starts_at: string
}

export type PublicMember = {
  id: string
  name: string
  instrument?: string | null
}

export type PublicProfileViewProps = {
  roleLabel: string // "Artist" | "Band" | "Venue"
  heroColor: string
  logoColor: string
  initials: string
  name: string
  byline?: string | null
  verified?: boolean
  genres?: string[]
  about?: string | null
  shows?: PublicShow[]
  members?: PublicMember[]
  showListen?: boolean
  following: boolean
  onBack: () => void
  onToggleFollow: () => void
  onMessage?: () => void
  onOpenShow?: (id: string) => void
  onOpenMember?: (id: string) => void
}

const GALLERY = ['#2D7FF9', '#8B5CF6', '#FFB020', '#1D9E75']

function dateBadge(iso: string): { mon: string; day: string } {
  const d = new Date(iso)
  return {
    mon: d.toLocaleDateString(undefined, { month: 'short' }),
    day: `${d.getDate()}`,
  }
}

function showLine(iso: string): string {
  const d = new Date(iso)
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' })
  let h = d.getHours()
  const m = d.getMinutes()
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${wd} · ${h}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function PublicProfileView(p: PublicProfileViewProps) {
  const genres = p.genres ?? []
  const shows = p.shows ?? []
  const members = p.members ?? []

  async function onShare() {
    await Share.share({ message: `${p.name} — on Who's Playing` })
  }

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">
        {/* Hero */}
        <View className="h-72 justify-end overflow-hidden" style={{ backgroundColor: p.heroColor }}>
          <Scrim />
          <SafeAreaView edges={['top']} className="absolute inset-x-0 top-0">
            <View className="mt-2 flex-row items-center justify-between px-4">
              <Pressable
                onPress={p.onBack}
                className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
              >
                <IconChevronLeft size={18} color="#071020" />
              </Pressable>
              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={onShare}
                  className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
                >
                  <IconShare size={17} color="#071020" />
                </Pressable>
                {p.onMessage ? (
                  <Pressable
                    onPress={p.onMessage}
                    className="h-[38px] w-[38px] items-center justify-center rounded-full bg-white/90"
                  >
                    <IconMessage2 size={17} color="#071020" />
                  </Pressable>
                ) : null}
                <Pressable
                  onPress={p.onToggleFollow}
                  className={`h-[38px] w-[38px] items-center justify-center rounded-full ${p.following ? 'bg-coral' : 'bg-white/90'}`}
                >
                  {p.following ? (
                    <IconHeartFilled size={17} color="#FFFFFF" />
                  ) : (
                    <IconHeart size={17} color="#FF5A5F" />
                  )}
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
          <View className="px-5 pb-5 pr-24">
            <View className="mb-2 flex-row items-center gap-1.5 self-start rounded-full bg-white/20 px-3 py-1">
              {p.verified ? <IconCircleCheckFilled size={12} color="#FFFFFF" /> : null}
              <Text className="text-[11px] font-extrabold uppercase tracking-wide text-white">{p.roleLabel}</Text>
            </View>
            <Text className="text-[28px] font-black leading-tight text-white">{p.name}</Text>
            {p.byline ? <Text className="mt-1 text-[14px] font-semibold text-white/90">{p.byline}</Text> : null}
          </View>
          {/* Circular logo badge */}
          <View
            className="absolute bottom-4 right-5 h-[60px] w-[60px] items-center justify-center rounded-full border-[3px] border-white"
            style={{ backgroundColor: p.logoColor }}
          >
            <Text className="text-[20px] font-extrabold text-white">{p.initials}</Text>
          </View>
        </View>

        <View className="px-5">
          {/* Genres */}
          {genres.length > 0 ? (
            <>
              <SecH>Genres</SecH>
              <View className="mt-3 flex-row flex-wrap gap-2">
                {genres.map((g) => (
                  <View key={g} className="rounded-full border border-ink-line bg-surface px-3 py-1.5">
                    <Text className="text-[12.5px] font-bold text-ink-slate">{g}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {/* About */}
          {p.about ? (
            <>
              <SecH>About</SecH>
              <Text className="mt-2.5 text-[14px] leading-6 text-ink-slate">{p.about}</Text>
            </>
          ) : null}

          {/* Upcoming shows */}
          <SecH>Upcoming shows</SecH>
          {shows.length === 0 ? (
            <Text className="mt-2.5 text-[13px] font-semibold text-ink-mute">No upcoming shows.</Text>
          ) : (
            <View className="mt-3">
              {shows.map((s) => {
                const b = dateBadge(s.starts_at)
                return (
                  <Pressable
                    key={s.id}
                    onPress={() => p.onOpenShow?.(s.id)}
                    className="mb-2.5 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-3 shadow-card"
                  >
                    <View className="h-[52px] w-[52px] items-center justify-center rounded-[13px] bg-[#EEF0F4]">
                      <Text className="text-[10px] font-extrabold uppercase text-ink-slate">{b.mon}</Text>
                      <Text className="text-[17px] font-extrabold leading-5 text-ink-deep">{b.day}</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-extrabold text-ink" numberOfLines={1}>
                        {s.title}
                      </Text>
                      {s.city ? (
                        <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{s.city}</Text>
                      ) : null}
                      <Text className="mt-0.5 text-[11.5px] font-semibold text-ink-mute">{showLine(s.starts_at)}</Text>
                    </View>
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-coral">
                      <IconArrowRight size={16} color="#FFFFFF" />
                    </View>
                  </Pressable>
                )
              })}
            </View>
          )}

          {/* Find us live — mini map placeholder */}
          <SecH>Find us live</SecH>
          <View className="mt-3 h-36 overflow-hidden rounded-2xl border border-ink-line" style={{ backgroundColor: '#E7ECF2' }}>
            <View className="absolute left-[34%] top-[40%] h-5 w-5 rounded-full border-2 border-white" style={{ backgroundColor: p.heroColor }} />
            <View className="absolute left-[62%] top-[58%] h-4 w-4 rounded-full border-2 border-white" style={{ backgroundColor: p.logoColor }} />
          </View>

          {/* Photos */}
          <SecH>Photos</SecH>
          <View className="mt-3 flex-row gap-2">
            {GALLERY.map((c) => (
              <View key={c} className="h-20 flex-1 rounded-xl" style={{ backgroundColor: c }} />
            ))}
          </View>

          {/* Members */}
          {members.length > 0 ? (
            <>
              <SecH>Members</SecH>
              <View className="mt-3">
                {members.map((m, i) => (
                  <Pressable
                    key={m.id}
                    onPress={() => p.onOpenMember?.(m.id)}
                    className="flex-row items-center gap-3 border-b border-ink-line py-3"
                  >
                    <View
                      className="h-[46px] w-[46px] items-center justify-center rounded-full"
                      style={{ backgroundColor: GALLERY[i % GALLERY.length] }}
                    >
                      <Text className="text-[15px] font-extrabold text-white">
                        {m.name.trim().charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="text-[15px] font-semibold text-ink">{m.name}</Text>
                      {m.instrument ? (
                        <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{m.instrument}</Text>
                      ) : null}
                    </View>
                    <IconChevronRight size={18} color="#9AA1AC" />
                  </Pressable>
                ))}
              </View>
              <Text className="mt-2 px-1 text-[12px] font-semibold leading-5 text-ink-mute">
                Each member has their own Who's Playing profile — tap to follow them too.
              </Text>
            </>
          ) : null}

          {/* Listen */}
          {p.showListen ? (
            <>
              <SecH>Listen</SecH>
              <View className="mt-3 flex-row flex-wrap gap-2">
                <LinkChip icon={IconBrandSpotify} color="#1DB954" label="Spotify" />
                <LinkChip icon={IconBrandBandcamp} label="Bandcamp" />
                <LinkChip icon={IconBrandYoutube} color="#FF0000" label="YouTube" />
              </View>
            </>
          ) : null}

          {/* Find us on social */}
          <SecH>Find us on social</SecH>
          <View className="mt-3 flex-row flex-wrap gap-2">
            <LinkChip icon={IconBrandInstagram} label="Instagram" />
            <LinkChip icon={IconBrandFacebook} color="#1877F2" label="Facebook" />
            <LinkChip icon={IconBrandTiktok} label="TikTok" />
          </View>
        </View>
      </ScrollView>

      {/* Sticky Follow / Message bar */}
      <SafeAreaView edges={['bottom']} className="absolute inset-x-0 bottom-0 border-t border-ink-line bg-surface">
        <View className="flex-row gap-3 px-5 py-3">
          <Pressable
            onPress={p.onToggleFollow}
            className={`flex-[1.4] flex-row items-center justify-center gap-1.5 rounded-[15px] py-3.5 ${p.following ? 'border border-ink-line bg-surface' : 'bg-coral'}`}
          >
            {p.following ? (
              <IconHeartFilled size={16} color="#FF5A5F" />
            ) : (
              <IconPlus size={16} color="#FFFFFF" />
            )}
            <Text className={`text-[15px] font-extrabold ${p.following ? 'text-ink' : 'text-white'}`}>
              {p.following ? 'Following' : 'Follow'}
            </Text>
          </Pressable>
          <Pressable
            onPress={p.onMessage}
            className="flex-1 items-center justify-center rounded-[15px] border border-ink-line bg-surface py-3.5"
          >
            <Text className="text-[15px] font-extrabold text-ink">Message</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  )
}

function SecH({ children }: { children: string }) {
  return <Text className="mt-6 text-[18px] font-extrabold text-ink-deep">{children}</Text>
}

function LinkChip({ icon: Icon, color, label }: { icon: TablerIcon; color?: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-full border border-ink-line bg-surface px-3.5 py-2">
      <Icon size={16} color={color ?? '#071020'} />
      <Text className="text-[13px] font-bold text-ink">{label}</Text>
    </View>
  )
}
