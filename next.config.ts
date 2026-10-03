import type { NextConfig } from "next";

// GitHub Pages repository subpath: /Obsisdian/
// In production builds, basePath defaults to /Obsisdian unless overridden via NEXT_PUBLIC_BASE_PATH
const isProd = process.env.NODE_ENV === "production";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? "/Obsisdian" : "");

const nextConfig: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
