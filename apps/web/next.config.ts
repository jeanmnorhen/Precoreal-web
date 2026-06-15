import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@precoreal/shared', '@precoreal/api-contracts', '@precoreal/api-client'],
  experimental: {
    optimizePackageImports: ['@precoreal/shared', '@precoreal/api-contracts', '@precoreal/api-client'],
  },
};

export default nextConfig;
