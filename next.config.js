// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            // ✅ Farcaster Mini App iframe allow
            key: "Content-Security-Policy",
            value:
              "frame-ancestors https://miniapps.farcaster.xyz https://*.farcaster.xyz 'self';",
          },
          {
            // ✅ required for iframe embedding
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
