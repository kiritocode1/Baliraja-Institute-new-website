import { isPublicMediaHostname } from "@/lib/assets";
import {
  CRM_MEDIA_PROXY_PREFIX,
  extractCrmMediaKey,
} from "@/lib/crm/media-proxy";

export function getS3Bucket() {
  return process.env.AWS_S3_BUCKET || process.env.NEXT_PUBLIC_AWS_S3_BUCKET;
}

export function getS3Region() {
  return (
    process.env.YOUR_AWS_REGION ||
    process.env.AWS_REGION ||
    process.env.AWS_DEFAULT_REGION ||
    process.env.NEXT_PUBLIC_YOUR_AWS_REGION ||
    "ap-south-1"
  );
}

export function getS3PublicBaseUrl() {
  const customBase = process.env.AWS_S3_PUBLIC_URL;

  if (customBase) return customBase.replace(/\/+$/, "");

  const bucket = getS3Bucket();
  if (!bucket) return "";

  return `https://${bucket}.s3.${getS3Region()}.amazonaws.com`;
}

export function getS3ObjectUrl(key: string) {
  const baseUrl = getS3PublicBaseUrl();
  const safeKey = key
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return baseUrl ? `${baseUrl}/${safeKey}` : "";
}

export function isAllowedCrmMediaUrl(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith(`${CRM_MEDIA_PROXY_PREFIX}/`)) return true;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return true;
  if (extractCrmMediaKey(trimmed)) return true;

  try {
    const url = new URL(trimmed);
    const s3BaseUrl = getS3PublicBaseUrl();
    const s3Host = s3BaseUrl ? new URL(s3BaseUrl).hostname : "";

    return (
      url.protocol === "https:" &&
      (isPublicMediaHostname(url.hostname) || url.hostname === s3Host)
    );
  } catch {
    return false;
  }
}
