import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'klodmnpgixkpfepyahae.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // avatars Google OAuth
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // upload fichiers projets
    },
  },
}

export default nextConfig
