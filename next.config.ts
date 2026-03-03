import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    // @ts-expect-error - Next.js 15/16 experimental feature not yet in TS definitions
    allowedDevOrigins: ['http://172.16.0.2', 'http://172.16.0.2:3000', '172.16.0.2', '172.16.0.2:3000', '172.16.0.2:3001', 'localhost', 'localhost:3000'],
  },
};

export default nextConfig;
