// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // apply to all routes (or narrow to just / or /.well-known)
        source: "/(.*)",
        headers: [
          // allow Base preview to frame your site
          { key: "Content-Security-Policy", value: "frame-ancestors https://base.dev https://base.build https://preview.base.build https://base.app 'self';" },
          // fallback for older browsers
          { key: "X-Frame-Options", value: "ALLOWALL" }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
