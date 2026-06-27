import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/crm/auth";
import { hasBlobStorage, uploadCrmBlob } from "@/lib/crm/blob";

export const runtime = "nodejs";

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
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

export async function POST(req: NextRequest) {
  await requireAdminSession();

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "blog").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Use an image, PDF, Word, or PowerPoint file.",
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

    if (hasBlobStorage()) {
      const blob = await uploadCrmBlob({
        pathname,
        body: buffer,
        contentType: file.type,
        access: "public",
      });

      return NextResponse.json({
        success: true,
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
        storage: "vercel-blob",
      });
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "media",
      `crm-${bucketFolder}`,
      month,
    );
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, safeName), buffer);

    return NextResponse.json({
      success: true,
      url: `/media/crm-${bucketFolder}/${month}/${safeName}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      storage: "local",
    });
  } catch (error) {
    console.error("[crm/media/upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
