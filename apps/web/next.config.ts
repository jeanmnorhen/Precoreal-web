import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@precoreal/shared'],
  experimental: {
    optimizePackageImports: ['@precoreal/shared'],
  },
};

export default nextConfig;
