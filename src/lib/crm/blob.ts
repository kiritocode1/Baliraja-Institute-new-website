import { get, put } from "@vercel/blob";

const CRM_BLOB_PREFIX = "crm/";

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadCrmBlob(input: {
  pathname: string;
  body: Buffer | Uint8Array;
  contentType?: string;
}) {
  if (!hasBlobStorage()) {
    throw new Error("Vercel Blob storage is not configured.");
  }

  const key = `${CRM_BLOB_PREFIX}${input.pathname.replace(/^\/+/, "")}`;
  const body = Buffer.isBuffer(input.body) ? input.body : Buffer.from(input.body);
  const blob = await put(key, body, {
    access: "public",
    contentType: input.contentType,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
    allowOverwrite: true,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return {
    key,
    url: blob.url,
  };
}

async function streamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}

export async function readCrmBlob(key: string) {
  if (!hasBlobStorage()) return null;

  try {
    const result = await get(key, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!result?.stream) return null;

    const body = await streamToBuffer(result.stream);

    return {
      body,
      contentType: result.blob.contentType || "application/octet-stream",
    };
  } catch {
    return null;
  }
}