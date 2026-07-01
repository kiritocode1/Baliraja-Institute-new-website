const ASSET_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "";

export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("/home/")) {
    return `${ASSET_BASE_URL}${path}`;
  }
  return path;
}
