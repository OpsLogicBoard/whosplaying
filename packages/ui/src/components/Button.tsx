import * as React from 'react'
import clsx from 'clsx'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'coral'
  size?: 'sm' | 'md' | 'lg'
}

const variants = {
  primary: 'bg-teal text-white shadow-stack-yellow hover:translate-x-[-2px] hover:translate-y-[-2px]',
  secondary: 'bg-yellow text-ink shadow-stack-teal hover:translate-x-[-2px] hover:translate-y-[-2px]',
  ghost: 'bg-transparent text-ink hover:bg-paper-cool',
  coral: 'bg-coral text-white shadow-stack-yellow hover:translate-x-[-2px] hover:translate-y-[-2px]',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-base rounded-lg',
  lg: 'px-6 py-3 text-lg rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center font-semibold transition-transform duration-150 active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
