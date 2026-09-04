import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "layesall.com",
      },
    ],
  }  
};

export default nextConfig;
