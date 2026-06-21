// Shared mobile UI primitives that mirror the v2 "Live Pin" prototype
// (docs/design/prototype.html). These reproduce the prototype's reusable
// pieces — coral CTA gradient, photo scrim, status pills, segmented control,
// toggle, feature-lock card — so screens stay consistent and terse.

import { IconBolt, IconChevronLeft, IconChevronRight, IconLock } from '@tabler/icons-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { renderIcon, type IconSpec } from './icon'

// --coralg: linear-gradient(135deg,#FF4F63,#FF6B42 48%,#FF2F70)
export const CORAL_GRADIENT = ['#FF4F63', '#FF6B42', '#FF2F70'] as const
const CORAL_LOCATIONS = [0, 0.48, 1] as const

/** Coral CTA gradient button (mockup .cta-create / .plcta / .upg). */
export function GradientButton({
  label,
  icon,
  onPress,
  disabled,
  size = 'lg',
}: {
  label: string
  icon?: IconSpec
  onPress?: () => void
  disabled?: boolean
  size?: 'lg' | 'md'
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ opacity: disabled ? 0.5 : 1 }}>
      <LinearGradient
        colors={CORAL_GRADIENT}
        locations={CORAL_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 15,
          paddingVertical: size === 'lg' ? 16 : 13,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {icon ? renderIcon(icon, 18, '#FFFFFF') : null}
        <Text className="text-[15px] font-extrabold text-white">{label}</Text>
      </LinearGradient>
    </Pressable>
  )
}

/** Dark photo scrim overlay (mockup --scrim), absolute-filled inside a hero. */
export function Scrim() {
  return (
    <LinearGradient
      colors={['rgba(7,16,32,0.80)', 'rgba(7,16,32,0.15)', 'transparent']}
      locations={[0, 0.52, 0.78]}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
    />
  )
}

// Status pill variants (mockup .statc / .st-*).
export type StatusKind = 'confirmed' | 'wait' | 'open' | 'muted'
const STATUS_STYLE: Record<StatusKind, { bg: string; fg: string }> = {
  confirmed: { bg: '#E1F5EE', fg: '#0F6E56' },
  wait: { bg: '#FAEEDA', fg: '#854F0B' },
  open: { bg: '#E6F1FB', fg: '#185FA5' },
  muted: { bg: '#EEF0F4', fg: '#5C6470' },
}

export function StatusBadge({ kind, label }: { kind: StatusKind; label: string }) {
  const s = STATUS_STYLE[kind]
  return (
    <View style={{ backgroundColor: s.bg }} className="self-start rounded-full px-2.5 py-1">
      <Text style={{ color: s.fg }} className="text-[10px] font-extrabold">
        {label}
      </Text>
    </View>
  )
}

/** Segmented control (mockup .seg). */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <View className="flex-row rounded-xl bg-[#EEF0F4] p-[3px]">
      {options.map((o) => {
        const on = o.value === value
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center rounded-[9px] py-2 ${on ? 'bg-surface' : ''}`}
          >
            <Text className={`text-[13px] font-bold ${on ? 'text-ink' : 'text-ink-slate'}`}>{o.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

/** iOS-style toggle (mockup .toggle). */
export function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      style={{ backgroundColor: on ? '#FF5A5F' : '#D7DBE2' }}
      className="h-7 w-[46px] justify-center rounded-full"
    >
      <View className="h-[22px] w-[22px] rounded-full bg-white" style={{ marginLeft: on ? 21 : 3 }} />
    </Pressable>
  )
}

/** Feature-lock nudge shown when a Free venue hits a Pro gate (mockup .lockcard). */
export function LockCard({
  title,
  body,
  ctaLabel,
  onUnlock,
}: {
  title: string
  body: string
  ctaLabel: string
  onUnlock?: () => void
}) {
  return (
    <View className="items-center rounded-[18px] border-[1.5px] border-dashed border-ink-mute bg-surface px-5 py-6">
      <View className="mb-3 flex-row justify-center gap-2 opacity-50">
        {[34, 22, 40, 28, 18].map((h, i) => (
          <View key={i} style={{ height: h, width: 14 }} className="self-end rounded-t bg-coral" />
        ))}
      </View>
      <View className="h-13 w-13 mb-3 items-center justify-center rounded-full bg-[#F2F4F7]" style={{ height: 52, width: 52 }}>
        <IconLock size={24} color="#5C6470" />
      </View>
      <View className="mb-2.5 flex-row items-center gap-1.5 rounded-full bg-coral-soft px-2.5 py-1">
        <IconBolt size={11} color="#FF5A5F" />
        <Text className="text-[10px] font-extrabold uppercase tracking-wide text-coral">Venue Pro</Text>
      </View>
      <Text className="text-[17px] font-extrabold text-ink-deep">{title}</Text>
      <Text className="mb-4 mt-1.5 text-center text-[13px] font-semibold leading-5 text-ink-slate">{body}</Text>
      <GradientButton label={ctaLabel} onPress={onUnlock} size="md" />
    </View>
  )
}

/** Hat / nav card used across the dashboard + settings (mockup .hat). */
export function HatCard({
  icon,
  tint,
  color,
  title,
  sub,
  badge,
  onPress,
}: {
  icon: IconSpec
  tint: string
  color: string
  title: string
  sub: string
  badge?: number
  onPress?: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2.5 flex-row items-center gap-3 rounded-[17px] border border-ink-line bg-surface p-[15px]"
    >
      <View className="h-[42px] w-[42px] items-center justify-center rounded-xl" style={{ backgroundColor: tint }}>
        {renderIcon(icon, 20, color)}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-extrabold text-ink">{title}</Text>
        <Text className="mt-0.5 text-[12.5px] font-semibold text-ink-slate">{sub}</Text>
      </View>
      {badge ? (
        <View className="h-[22px] min-w-[22px] items-center justify-center rounded-full bg-coral px-1.5">
          <Text className="text-[11px] font-extrabold text-white">{badge}</Text>
        </View>
      ) : (
        <IconChevronRight size={18} color="#9AA1AC" />
      )}
    </Pressable>
  )
}

/** Simple screen header with a circular back button (mockup .gbtn / .pmtop). */
export function BackHeader({ title, onBack, right }: { title?: string; onBack: () => void; right?: ReactNode }) {
  return (
    <View className="flex-row items-center gap-3 px-5 pt-1">
      <Pressable
        onPress={onBack}
        className="h-10 w-10 items-center justify-center rounded-full border border-ink-line bg-surface"
      >
        <IconChevronLeft size={20} color="#071020" />
      </Pressable>
      {title ? <Text className="flex-1 text-[21px] font-extrabold text-ink-deep">{title}</Text> : <View className="flex-1" />}
      {right}
    </View>
  )
}
