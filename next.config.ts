import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Canonicalize on the apex: send www.sevakhoj.com/<path> → sevakhoj.com/<path>
      // (permanent = 308). Keeps one canonical host for SEO and sharing.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.sevakhoj.com" }],
        destination: "https://sevakhoj.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
