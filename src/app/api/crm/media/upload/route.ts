import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/crm/auth";
import { getCrmMediaProxyUrl } from "@/lib/crm/media-proxy";
import { hasR2Storage, uploadCrmR2 } from "@/lib/crm/r2";
import { hasS3Storage, uploadCrmS3 } from "@/lib/crm/s3";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
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
const ALLOWED_FILE_TYPES = new Set([
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

function resolveContentType(file: File) {
  if (file.type && ALLOWED_FILE_TYPES.has(file.type)) return file.type;

  const extension = getSafeExtension(file);
  return EXTENSION_CONTENT_TYPES[extension] ?? file.type;
}

function isProductionDeploy() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "blog").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const contentType = resolveContentType(file);

    if (contentType === "image/heic" || contentType === "image/heif") {
      return NextResponse.json(
        {
          error:
            "HEIC photos are not supported in the browser. Export the image as JPEG or PNG and try again.",
        },
        { status: 415 },
      );
    }

    if (!ALLOWED_FILE_TYPES.has(contentType)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Use a JPEG, PNG, WebP, or GIF image.",
        },
        { status: 415 },
      );
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum upload size is 15MB." },
        { status: 413 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const extension = getSafeExtension(file);
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
    const month = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
    }).format(new Date());
    const bucketFolder = folder === "notices" ? "notices" : "blog";
    const pathname = `${bucketFolder}/${month}/${safeName}`;

    if (!hasR2Storage() && !hasS3Storage() && isProductionDeploy()) {
      return NextResponse.json(
        {
          error:
            "Cloud storage is not configured for production uploads. Set R2 variables or AWS S3 credentials in Vercel.",
        },
        { status: 503 },
      );
    }

    const storageKey = `crm/${pathname}`;

    if (hasR2Storage()) {
      await uploadCrmR2({
        pathname,
        body: buffer,
        contentType,
      });
    } else if (hasS3Storage()) {
      await uploadCrmS3({
        pathname,
        body: buffer,
        contentType,
      });
    } else {
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

    return NextResponse.json({
      success: true,
      url: getCrmMediaProxyUrl(storageKey),
      filename: file.name,
      size: file.size,
      type: contentType,
      storage: hasR2Storage() ? "r2" : hasS3Storage() ? "s3" : "local",
    });
  } catch (error) {
    console.error("[crm/media/upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
