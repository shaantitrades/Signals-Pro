/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
    NEXT_PUBLIC_SIGNAL_ENGINE_URL: process.env.NEXT_PUBLIC_SIGNAL_ENGINE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
  async redirects() {
    return [
      // Canonical host: always serve the apex domain.
      // Needed so that both /ads.txt and /robots.txt (checked by the Google
      // AdSense crawler on the root domain AND on the www subdomain) resolve
      // on a single, certified hostname.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.marketsignals24.com' }],
        destination: 'https://marketsignals24.com/:path*',
        permanent: true,
      },
      { source: '/dashboard/bot', destination: '/dashboard/tradingbot', permanent: true },
      { source: '/dashboard/signals', destination: '/dashboard/livesignals', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        // Never cache HTML pages — ensures users always get the latest deployment
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        // ads.txt for Google AdSense verification
        source: '/ads.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
        ],
      },
      {
        // Static assets (_next/static) can be cached long-term (they are content-hashed)
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
