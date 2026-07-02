import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rnhnuounnxhcdnregeft.supabase.co",
      },
    ],
  },
}

export default nextConfig
