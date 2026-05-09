import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/onboarding/language.",
        destination: "/onboarding/language",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
