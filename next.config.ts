import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
  webpack(config) {
    config.resolve.modules = [path.resolve(__dirname, "node_modules"), "node_modules"];
    return config;
  },
};

export default nextConfig;
