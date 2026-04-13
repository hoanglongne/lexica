import type { NextConfig } from "next";

// @ts-expect-error - next-pwa types are outdated for Next.js 16
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  turbopack: {}, // Allow webpack config from next-pwa
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWAConfig(nextConfig as Parameters<typeof withPWAConfig>[0]);
