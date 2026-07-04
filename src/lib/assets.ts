const bucket = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || "baliraja";
const region = process.env.NEXT_PUBLIC_YOUR_AWS_REGION || "ap-south-1";

const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ||
  (process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    ? process.env.NEXT_PUBLIC_R2_PUBLIC_URL
    : `https://${bucket}.s3.${region}.amazonaws.com`);

export function getAssetUrl(path: string): string {
  if (!path) return "";
  const prefixes = [
    "/home/",
    "/about/",
    "/courses/",
    "/student-life/",
    "/admissions/",
    "/gallery/",
    "/hero.mp4",
    "/hero-poster.jpg",
    "/model.glb",
    "/img-books.jpg",
    "/img-classroom.jpg",
    "/img-reading.jpg",
    "/img-study.jpg"
  ];
  if (prefixes.some((p) => path.startsWith(p))) {
    return `${ASSET_BASE_URL}${path}`;
  }
  return path;
}
