import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Job applications upload a CV (max 4 MB) through a Server Action; the
      // default limit is 1 MB. Vercel's own cap on request bodies is 4.5 MB.
      bodySizeLimit: "4.5mb",
    },
  },
};

export default nextConfig;
