import type { NextConfig } from "next";

if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = require('@cloudflare/next-on-pages/next-dev');
  setupDevPlatform();
}

const nextConfig: NextConfig = {
  // Allow images from Cloudflare Stream and R2
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'videodelivery.net' },
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: '*.cloudflarestream.com' },
      { protocol: 'https', hostname: 'imagedelivery.net' },
    ],
  },
  // Suppress the hydration warning about `dir` attribute
  experimental: {
    optimizePackageImports: ['jose', 'bcryptjs'],
  },
};

export default nextConfig;
