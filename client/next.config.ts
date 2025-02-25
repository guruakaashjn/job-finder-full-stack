import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // domains: ["s.gravatar.com"],     DEPRICATED
    remotePatterns: [{ hostname: "s.gravatar.com" }],
  },
};

export default nextConfig;
