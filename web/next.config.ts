import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Indique à Next.js d'accepter Turbopack
  turbopack: {},
  allowedDevOrigins: ['192.168.129.12'],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "layesall.com",
      },
    ],
  },
};

export default nextConfig;