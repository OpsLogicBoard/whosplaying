import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@whosplaying/ui', '@whosplaying/core', '@whosplaying/supabase'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  // Pin the workspace root so Next.js doesn't mistakenly pick a stray
  // package-lock.json higher in the filesystem (e.g. ~/package-lock.json).
  outputFileTracingRoot: path.join(__dirname, '../..'),
}

export default nextConfig
