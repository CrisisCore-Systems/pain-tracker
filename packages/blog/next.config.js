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
  // Enable static export for hosting on Vercel/Netlify
  // Comment this out if you want SSR
  // output: 'export',
};

module.exports = nextConfig;
