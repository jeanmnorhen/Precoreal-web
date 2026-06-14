"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nextConfig = {
    transpilePackages: ['@precoreal/shared'],
    experimental: {
        optimizePackageImports: ['@precoreal/shared'],
    },
};
exports.default = nextConfig;
