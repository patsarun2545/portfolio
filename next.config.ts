import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "devicon.dev",
      },
      {
        protocol: "https",
        hostname: "simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "github-readme-stats.vercel.app",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(",")
        : process.env.NODE_ENV === "production"
          ? [process.env.NEXTAUTH_URL || ""]
          : ["localhost:3000"],
    },
  },
  async headers() {
    const isDev = process.env.NODE_ENV === "development";

    // ✅ เพิ่ม GitHub API ใน connect-src
    const githubApi = "https://api.github.com";

    const cspValue = isDev
      ? `default-src 'self' 'unsafe-inline' 'unsafe-eval'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ik.imagekit.io https://cdn.jsdelivr.net https://devicon.dev https://simpleicons.org data: blob:; font-src 'self' data:; connect-src 'self' https://ik.imagekit.io https://cdn.jsdelivr.net https://devicon.dev https://simpleicons.org ${githubApi}; frame-ancestors 'none';`
      : `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ik.imagekit.io https://cdn.jsdelivr.net https://devicon.dev https://simpleicons.org data: blob:; font-src 'self' data:; connect-src 'self' https://ik.imagekit.io https://cdn.jsdelivr.net https://devicon.dev https://simpleicons.org ${githubApi}; frame-ancestors 'none';`;

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: cspValue,
          },
        ],
      },
    ];
  },
};

export default nextConfig;