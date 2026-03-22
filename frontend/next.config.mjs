import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, ".."),
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: "/logo.svg", destination: "/icon.svg", permanent: true },
      { source: "/store-web-logo.svg", destination: "/icon.svg", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/icon.svg",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, must-revalidate" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "3000" },
      { protocol: "http", hostname: "localhost", port: "5000" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;

