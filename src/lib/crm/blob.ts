import { del, list, put } from "@vercel/blob";

const CRM_BLOB_PREFIX = "crm/";

export function hasBlobStorage() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadCrmBlob(input: {
  pathname: string;
  body: Parameters<typeof put>[1];
  contentType?: string;
  access?: "public" | "private";
}) {
  const pathname = `${CRM_BLOB_PREFIX}${input.pathname.replace(/^\/+/, "")}`;

  return put(pathname, input.body, {
    access: input.access ?? "private",
    addRandomSuffix: true,
    contentType: input.contentType,
  });
}

export async function listCrmBlobs() {
  return list({ prefix: CRM_BLOB_PREFIX });
}

export async function deleteCrmBlob(urlOrPathname: string) {
  return del(urlOrPathname);
}
