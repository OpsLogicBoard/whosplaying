import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed, DM_Sans, JetBrains_Mono, Fraunces } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

// Inter — the v2 "Live Pin" typeface. Exposed as --font-sans, which the shared
// Tailwind preset's font stack resolves to (so web matches the mobile app).
const interFont = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
})

const displayFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '600', '700', '900'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

// Editorial display face — Fraunces, variable. Used on the magazine-
// style reference compositions. Contemporary serif with subtle warmth,
// strong at large sizes without feeling period.
const editorialFont = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-editorial',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://whosplaying.live'),
  title: {
    default: "Who's Playing — Live local music",
    template: "%s · Who's Playing",
  },
  description: 'Discover live music near you. For artists, venues, and music-goers.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://whosplaying.live',
    siteName: "Who's Playing",
    title: "Who's Playing — Live local music",
    description: 'Discover live music near you. For artists, venues, and music-goers.',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Who's Playing — Live local music",
    description: 'Discover live music near you. For artists, venues, and music-goers.',
  },
}

export const viewport: Viewport = {
  themeColor: '#FF5A5F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interFont.variable} ${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} ${editorialFont.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
