import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Suppress Serwist Turbopack warning (safe — Serwist is disabled in dev mode)
if (process.env.NODE_ENV === "development") {
  process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = "1";
}

import withSerwistInit from "@serwist/next";

// Serwist Service Worker configuration
// DISABLED in development (no Service Worker during dev with Turbopack)
// ENABLED in production (PWA + offline support, does not require Turbopack)
// See: https://serwist.pages.dev/docs/next/turbo
const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Next.js 15+ STRICTly validates Cross-Origin dev requests. We must explicitly allow the user's subnet.
  allowedDevOrigins: [
    '192.168.161.245', 
    '192.168.161.245:3000', 
    '172.16.0.2:3001', 
    '172.16.0.2', 
    'localhost:3000', 
    'localhost:3001'
  ],
  // Force CORS headers natively for all _next internal chunks + security headers
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    ];

    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
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
