import type { NextConfig } from "next";

function getR2RemotePattern() {
  const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!url) return null;

  try {
    const hostname = new URL(url).hostname;

    if (hostname.endsWith(".r2.dev")) return null;

    return {
      protocol: "https" as const,
      hostname,
      pathname: "/**",
    };
  } catch {
    return null;
  }
}

const r2RemotePattern = getR2RemotePattern();

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // sharp is installed — Next.js Image Optimization is active.
    // Images are fetched from R2 once, converted to WebP/AVIF, and cached for 30 days.
    qualities: [60, 75],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384, 512],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
        pathname: "/**",
      },
      // Custom domains that proxy Cloudflare R2 (e.g. assets.baliraja.com)
      {
        protocol: "https",
        hostname: "**.baliraja.com",
        pathname: "/**",
      },
      ...(r2RemotePattern ? [r2RemotePattern] : []),
    ],
  },
};

export default nextConfig;