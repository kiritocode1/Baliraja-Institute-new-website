import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const CRM_R2_PREFIX = "crm/";

function getR2Credentials() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) return null;

  return { accessKeyId, secretAccessKey };
}

export function getR2Bucket() {
  return process.env.R2_BUCKET_NAME;
}

export function getR2PublicBaseUrl() {
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;

  if (!base) return "";

  return base.replace(/\/+$/, "");
}

export function getR2ObjectUrl(key: string) {
  const baseUrl = getR2PublicBaseUrl();
  const safeKey = key
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return baseUrl ? `${baseUrl}/${safeKey}` : "";
}

export function hasR2Storage() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      getR2Bucket() &&
      getR2Credentials() &&
      getR2PublicBaseUrl(),
  );
}

export async function uploadCrmR2(input: {
  pathname: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}) {
  const bucket = getR2Bucket();
  const accountId = process.env.R2_ACCOUNT_ID;
  const credentials = getR2Credentials();
  const baseUrl = getR2PublicBaseUrl();

  if (!bucket || !accountId || !credentials || !baseUrl) {
    throw new Error("R2 storage is not configured.");
  }

  const key = `${CRM_R2_PREFIX}${input.pathname.replace(/^\/+/, "")}`;
  const r2 = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials,
  });

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: input.body,
      ContentType: input.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    key,
    url: getR2ObjectUrl(key),
  };
}