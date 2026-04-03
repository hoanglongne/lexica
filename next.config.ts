import type { NextConfig } from "next";

// @ts-ignore - next-pwa types are outdated for Next.js 16
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // Allow webpack config from next-pwa
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})(nextConfig as any) as NextConfig;
