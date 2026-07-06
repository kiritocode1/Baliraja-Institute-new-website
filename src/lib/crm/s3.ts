import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  getS3Bucket,
  getS3ObjectUrl,
  getS3Region,
} from "@/lib/crm/media-storage";

const CRM_S3_PREFIX = "crm/";

function getS3Credentials() {
  const accessKeyId =
    process.env.YOUR_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey =
    process.env.YOUR_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) return null;

  return { accessKeyId, secretAccessKey };
}

export function hasS3Storage() {
  return Boolean(getS3Bucket() && getS3Region() && getS3Credentials());
}

export async function uploadCrmS3(input: {
  pathname: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}) {
  const bucket = getS3Bucket();
  const credentials = getS3Credentials();

  if (!bucket || !credentials) {
    throw new Error("S3 storage is not configured.");
  }

  const key = `${CRM_S3_PREFIX}${input.pathname.replace(/^\/+/, "")}`;
  const s3 = new S3Client({
    region: getS3Region(),
    credentials,
  });

  const commandInput = {
    Bucket: bucket,
    Key: key,
    Body: input.body,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable",
  };

  try {
    await s3.send(
      new PutObjectCommand({ ...commandInput, ACL: "public-read" }),
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const aclUnsupported =
      (error as { name?: string }).name === "AccessControlListNotSupported" ||
      message.includes("ACL");

    if (!aclUnsupported) throw error;

    await s3.send(new PutObjectCommand(commandInput));
  }

  return {
    key,
    url: getS3ObjectUrl(key),
  };
}
