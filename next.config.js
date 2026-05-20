/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // app-build-manifest.json is not publicly accessible in Next.js 14 App Router
  // (it's in .next/, not served via /_next/). Excluding prevents SW install failure.
  buildExcludes: [/app-build-manifest\.json$/],
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
