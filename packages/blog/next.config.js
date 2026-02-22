/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.hashnode.com',
        pathname: '/**',
      },
    ],
  },

  // ── Redirects ──────────────────────────────────────────────────────
  // Note: Domain-level redirects (non-www → www, /sponsor, /blog) are
  // handled by the root vercel.json on the www.paintracker.ca deployment.
  // Only blog-specific redirects belong here.
  async redirects() {
    return [
      {
        source: '/start-here',
        destination: '/page/start-here',
        permanent: true,
      },
      {
        source: '/start-here/',
        destination: '/page/start-here',
        permanent: true,
      },
    ];
  },

  // ── Rewrites ────────────────────────────────────────────────────────
  async rewrites() {
    return [
      // Weather API proxy (external)
      {
        source: '/api/weather',
        destination: 'https://api.open-meteo.com/v1/forecast',
      },
    ];
  },

  // ── Headers ─────────────────────────────────────────────────────────
  async headers() {
    return [
      // Tell crawlers not to index the PWA shell
      {
        source: '/app/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      // Immutable cache for hashed PWA assets
      {
        source: '/app/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Security headers for all routes
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://cdn.hashnode.com",
              "connect-src 'self'",
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ') + ';',
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), bluetooth=()',
          },
        ],
      },
    ];
  },

  // Enable static export for hosting on Vercel/Netlify
  // Comment this out if you want SSR
  // output: 'export',
};

module.exports = nextConfig;
