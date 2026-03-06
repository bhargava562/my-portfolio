import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Next.js 15+ STRICTly validates Cross-Origin dev requests. We must explicitly allow the user's subnet.
  allowedDevOrigins: ['192.168.161.245', '192.168.161.245:3000', '192.168.*', 'localhost:3000'],
  // Force CORS headers natively for all _next internal chunks
  async headers() {
    return [
      {
        source: '/_next/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  // Optimizes the build footprint massively for Node/Docker clusters
  output: 'standalone',
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
};

export default withSentryConfig(withSerwist(nextConfig), {
  org: "placeholder-org",
  project: "portfolio-os",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
});
