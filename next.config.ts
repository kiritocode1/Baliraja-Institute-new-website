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
    unoptimized: true,
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
      ...(r2RemotePattern ? [r2RemotePattern] : []),
    ],
  },
};

export default nextConfig;