// Standard elevation shadows. (The earlier retired "stacked color" offsets
// have been removed.)

export const shadows = {
  card: '0 1px 2px rgba(14, 26, 26, 0.04), 0 4px 12px rgba(14, 26, 26, 0.06)',
  lift: '0 4px 8px rgba(14, 26, 26, 0.06), 0 16px 32px rgba(14, 26, 26, 0.10)',
} as const

export type Shadows = typeof shadows
