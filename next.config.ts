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

  // ═══════════════════════════════════════════════════════════════════════════════
  // CHALLENGE 3: Security Headers & Build Footprint Masking
  // ═══════════════════════════════════════════════════════════════════════════════
  //
  // Problem:
  // - Wappalyzer / Netcraft can detect Next.js via X-Powered-By header
  // - Fingerprinting tools detect Next.js build artifacts
  //
  // Solution:
  // - Strict CSP headers to block XSS/injection
  // - X-Frame-Options to prevent clickjacking
  // - Remove X-Powered-By header
  // - Mask build footprint via custom headers
  //
  async headers() {
    const securityHeaders = [
      // ─── Anti-XSS & Content Security ───
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.sentry.io https://cdn.jsdelivr.net",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https: blob:",
          "font-src 'self' data: https:",
          "connect-src 'self' https: wss:",
          "frame-ancestors 'none'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join('; '),
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },

      // ─── Privacy & Referrer Policy ───
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
      },

      // ─── HSTS (HTTP Strict Transport Security) ───
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },

      // ─── Anti-Reconnaissance: Hide Build Fingerprint ───
      // Remove/mask common Next.js detection vectors
      {
        key: 'X-Powered-By',
        value: 'PHP/7.4.33', // False positive to confuse Wappalyzer
      },
      {
        key: 'Server',
        value: 'nginx/1.24.0', // Masquerade as nginx
      },

      // ─── Additional Hardening ───
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'require-corp',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin',
      },
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
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },

  // Optimizes the build footprint massively for Node/Docker clusters
  output: 'standalone',

  // Strip Next.js version info from generated files
  productionBrowserSourceMaps: false,

  experimental: {
    // Suppress Sentry clientTraceMetadata experiment warning
    clientTraceMetadata: undefined,
  },

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

  webpack: (config, { isServer }) => {
    // Strip sourcemaps in production (hides implementation details)
    if (!isServer) {
      config.devtool = false;
    }

    return config;
  },
};

export default withSentryConfig(withSerwist(nextConfig), {
  org: "placeholder-org",
  project: "portfolio-os",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});