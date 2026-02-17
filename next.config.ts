import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/page", destination: "/", permanent: false },
      { source: "/index", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
