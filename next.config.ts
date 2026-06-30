import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://neostudio.space https://*.neostudio.space",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/services", destination: "/#modal-menu", permanent: false },
      { source: "/team", destination: "/#modal-team", permanent: false },
      { source: "/about", destination: "/#modal-about", permanent: false },
      { source: "/visit", destination: "/#modal-visit", permanent: false },
      { source: "/privacy", destination: "/#modal-privacy", permanent: false },
      { source: "/cancellation", destination: "/#modal-cancellation", permanent: false },
    ];
  },
};

export default nextConfig;
