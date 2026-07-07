import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { hasBlobStorage, uploadCrmBlob } from "@/lib/crm/blob";
import type { CrmMediaStorage } from "@/lib/crm/config";
import { getCrmMediaProxyUrl } from "@/lib/crm/media-proxy";
import { hasR2Storage, uploadCrmR2 } from "@/lib/crm/r2";
import { hasS3Storage, uploadCrmS3 } from "@/lib/crm/s3";

export const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

export const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function getSafeExtension(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension && /^[a-z0-9]+$/.test(extension)) return extension;

  return file.type.split("/")[1]?.replace(/[^a-z0-9]/g, "") || "bin";
}

export function resolveContentType(file: File) {
  if (file.type && ALLOWED_FILE_TYPES.has(file.type)) return file.type;

  const extension = getSafeExtension(file);
  return EXTENSION_CONTENT_TYPES[extension] ?? file.type;
}

function isProductionDeploy() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export type CrmMediaUploadResult = {
  url: string;
  filename: string;
  size: number;
  type: string;
  storage: CrmMediaStorage;
};

/**
 * Validate and store a CRM media file (R2 → Blob → S3 → local-dev fallback).
 * Throws with a user-facing message on validation or storage failure.
 */
export async function uploadCrmMediaFile(
  file: File,
  folder: string,
): Promise<CrmMediaUploadResult> {
  const contentType = resolveContentType(file);

  if (contentType === "image/heic" || contentType === "image/heif") {
    throw new Error(
      "HEIC photos are not supported in the browser. Export the image as JPEG or PNG and try again.",
    );
  }

  if (!ALLOWED_FILE_TYPES.has(contentType)) {
    throw new Error(
      "Unsupported file type. Use a JPEG, PNG, WebP, or GIF image.",
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error("File too large. Maximum upload size is 15MB.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const extension = getSafeExtension(file);
  const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  const month = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const bucketFolder = /^[a-z-]+$/.test(folder) ? folder : "blog";
  const pathname = `${bucketFolder}/${month}/${safeName}`;

  if (
    !hasR2Storage() &&
    !hasBlobStorage() &&
    !hasS3Storage() &&
    isProductionDeploy()
  ) {
    throw new Error(
      "Cloud storage is not configured for production uploads. Set R2, Vercel Blob, or AWS S3 credentials in Vercel.",
    );
  }

  const storageKey = `crm/${pathname}`;
  const uploadInput = { pathname, body: buffer, contentType };
  let storage: CrmMediaStorage = "local";

  async function writeLocal() {
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "media",
      `crm-${bucketFolder}`,
      month,
    );
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);
  }

  if (hasR2Storage()) {
    try {
      await uploadCrmR2(uploadInput);
      storage = "r2";
    } catch (error) {
      console.warn(
        "[crm/media-upload] R2 upload failed, trying fallback:",
        error,
      );

      if (hasBlobStorage()) {
        await uploadCrmBlob(uploadInput);
        storage = "blob";
      } else if (hasS3Storage()) {
        await uploadCrmS3(uploadInput);
        storage = "s3";
      } else if (!isProductionDeploy()) {
        await writeLocal();
        storage = "local";
      } else {
        throw error;
      }
    }
  } else if (hasBlobStorage()) {
    await uploadCrmBlob(uploadInput);
    storage = "blob";
  } else if (hasS3Storage()) {
    await uploadCrmS3(uploadInput);
    storage = "s3";
  } else {
    await writeLocal();
  }

  return {
    url: getCrmMediaProxyUrl(storageKey),
    filename: file.name,
    size: file.size,
    type: contentType,
    storage,
  };
}
