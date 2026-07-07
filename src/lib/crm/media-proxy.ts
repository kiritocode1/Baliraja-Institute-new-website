import { readFile } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readCrmBlob } from "@/lib/crm/blob";
import { getS3Bucket, getS3Region } from "@/lib/crm/media-storage";
import { getR2Bucket, hasR2Storage } from "@/lib/crm/r2";
import { hasS3Storage } from "@/lib/crm/s3";

export const CRM_MEDIA_PROXY_PREFIX = "/api/crm/media/file";

const CRM_MEDIA_KEY_RE =
  /^crm\/(blog|notices)\/\d{4}-\d{2}\/[a-z0-9][a-z0-9._-]*$/i;

function getR2Credentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) return null;

  return { accessKeyId, secretAccessKey };
}

function getS3Credentials() {
  const accessKeyId =
    process.env.YOUR_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.YOUR_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) return null;

  return { accessKeyId, secretAccessKey };
}

export function isValidCrmMediaKey(key: string) {
  return CRM_MEDIA_KEY_RE.test(key.replace(/^\/+/, ""));
}

export function getCrmMediaProxyUrl(key: string) {
  const normalized = key.replace(/^\/+/, "");
  const safeKey = normalized
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${CRM_MEDIA_PROXY_PREFIX}/${safeKey}`;
}

export function extractCrmMediaKey(value: string) {
  const trimmed = value.trim();

  if (trimmed.startsWith(`${CRM_MEDIA_PROXY_PREFIX}/`)) {
    const key = decodeURIComponent(
      trimmed.slice(CRM_MEDIA_PROXY_PREFIX.length + 1),
    );
    return isValidCrmMediaKey(key) ? key.replace(/^\/+/, "") : null;
  }

  const localMatch = trimmed.match(
    /^\/media\/crm-(blog|notices)\/(\d{4}-\d{2})\/([^/?#]+)$/i,
  );
  if (localMatch) {
    const key = `crm/${localMatch[1]}/${localMatch[2]}/${localMatch[3]}`;
    return isValidCrmMediaKey(key) ? key : null;
  }

  try {
    const pathname = trimmed.startsWith("http")
      ? new URL(trimmed).pathname
      : trimmed;
    const remoteMatch = pathname.match(
      /\/crm\/(blog|notices)\/(\d{4}-\d{2})\/([^/?#]+)$/i,
    );

    if (!remoteMatch) return null;

    const key = `crm/${remoteMatch[1]}/${remoteMatch[2]}/${remoteMatch[3]}`;
    return isValidCrmMediaKey(key) ? key : null;
  } catch {
    return null;
  }
}

export function resolveCrmMediaUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const key = extractCrmMediaKey(trimmed);
  if (key) return getCrmMediaProxyUrl(key);

  return trimmed;
}

function localMediaPath(key: string) {
  const [, folder, month, filename] = key.split("/");
  return path.join(
    process.cwd(),
    "public",
    "media",
    `crm-${folder}`,
    month,
    filename,
  );
}

async function readObjectBody(
  body: { transformToByteArray: () => Promise<Uint8Array> } | undefined,
) {
  if (!body) return null;

  return Buffer.from(await body.transformToByteArray());
}

async function readCrmR2Object(key: string) {
  const bucket = getR2Bucket();
  const accountId = process.env.R2_ACCOUNT_ID;
  const credentials = getR2Credentials();

  if (!bucket || !accountId || !credentials) return null;

  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials,
  });
  const result = await r2.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
  const body = await readObjectBody(result.Body);

  if (!body) return null;

  return {
    body,
    contentType: result.ContentType || "application/octet-stream",
  };
}

export async function readCrmMediaObject(key: string) {
  if (!isValidCrmMediaKey(key)) return null;

  if (hasR2Storage()) {
    try {
      const asset = await readCrmR2Object(key);
      if (asset) return asset;
    } catch (error) {
      console.warn("[crm/media] R2 read failed, trying Blob fallback:", error);
    }
  }

  const blobAsset = await readCrmBlob(key);
  if (blobAsset) return blobAsset;

  if (hasS3Storage()) {
    const bucket = getS3Bucket();
    const credentials = getS3Credentials();

    if (bucket && credentials) {
      const s3 = new S3Client({
        region: getS3Region(),
        credentials,
      });
      const result = await s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        }),
      );
      const body = await readObjectBody(result.Body);

      if (body) {
        return {
          body,
          contentType: result.ContentType || "application/octet-stream",
        };
      }
    }
  }

  try {
    const body = await readFile(localMediaPath(key));
    const extension = path.extname(key).toLowerCase();
    const contentType =
      extension === ".png"
        ? "image/png"
        : extension === ".webp"
          ? "image/webp"
          : extension === ".gif"
            ? "image/gif"
            : extension === ".svg"
              ? "image/svg+xml"
              : "image/jpeg";

    return { body, contentType };
  } catch {
    return null;
  }
}
