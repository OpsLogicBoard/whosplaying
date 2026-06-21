import * as React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /** `primary` = coral CTA gradient. `dark` = heavy ink action. `secondary` = bordered surface. `ghost` = bare. */
  variant?: 'primary' | 'dark' | 'secondary' | 'ghost' | 'coral'
  size?: 'sm' | 'md' | 'lg'
}

// Canonical v2 coral CTA gradient (BRAND.md): 135deg, #FF4F63 → #FF6B42 48% → #FF2F70.
const CORAL_GRADIENT =
  'linear-gradient(135deg, #FF4F63 0%, #FF6B42 48%, #FF2F70 100%)'

const variants = {
  primary: 'text-white shadow-card hover:shadow-lift',
  coral: 'text-white shadow-card hover:shadow-lift', // back-compat alias → primary gradient
  dark: 'bg-ink-deep text-white hover:bg-ink',
  secondary: 'bg-surface text-ink border border-ink-line hover:bg-canvas',
  ghost: 'bg-transparent text-ink hover:bg-canvas',
}

const sizes = {
  sm: 'px-3.5 py-2 text-sm rounded-md gap-1.5',
  md: 'px-4 py-2.5 text-[15px] rounded-lg gap-2',
  lg: 'px-6 py-3.5 text-base rounded-lg gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  style,
  children,
  ...rest
}: ButtonProps) {
  const isGradient = variant === 'primary' || variant === 'coral'
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-extrabold transition-all duration-150 active:scale-[0.98] disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      style={isGradient ? { backgroundImage: CORAL_GRADIENT, ...style } : style}
      {...rest}
    >
      {children}
    </button>
  )
}
