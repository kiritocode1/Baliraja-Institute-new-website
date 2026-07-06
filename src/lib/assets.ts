const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "baliraja";
const region = process.env.NEXT_PUBLIC_YOUR_AWS_REGION || "ap-south-1";

const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    ? process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    : `https://${bucket}.s3.${region}.amazonaws.com`);

/**
 * Resolve a static asset path to its cloud URL.
 *
 * Rules:
 * - Already-absolute URLs (http / https) are returned unchanged.
 * - Empty strings are returned unchanged.
 * - Everything else is treated as a cloud-hosted asset and prefixed
 *   with ASSET_BASE_URL. A leading slash is added if the path lacks one
 *   so that bare paths like "admissions/foo.png" work correctly.
 */
export function getAssetUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${ASSET_BASE_URL}${normalised}`;
}

/**
 * Derive a poster / thumbnail URL from a video path.
 *
 * Convention: upload `<videoname>-poster.jpg` to R2 alongside each video.
 * Example: `/home/hero-video.mp4` → `<BASE>/home/hero-video-poster.jpg`
 *
 * If the poster file is absent on R2 the browser silently shows a blank frame —
 * no error is thrown.
 */
export function getVideoPosterUrl(videoPath: string): string {
  if (!videoPath) return "";
  // Strip query-string / fragment, then swap extension for -poster.jpg
  const base = videoPath.split("?")[0].split("#")[0];
  const poster = base.replace(/\.(mp4|mov|webm|MOV|MP4|WEBM)$/, "-poster.jpg");
  return getAssetUrl(poster);
}
