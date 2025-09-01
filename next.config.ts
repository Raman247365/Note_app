import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Exclude backend directory from webpack processing
    config.module.rules.push({
      test: /\.ts$/,
      include: /backend/,
      use: 'ignore-loader'
    });
    
    return config;
  },
  // Ignore backend directory during build
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  transpilePackages: [],
};

export default nextConfig;