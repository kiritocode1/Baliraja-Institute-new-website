import { type NextRequest, NextResponse } from "next/server";
import {
  isValidCrmMediaKey,
  readCrmMediaObject,
} from "@/lib/crm/media-proxy";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ key: string[] }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
  const { key: segments } = await context.params;
  const key = segments.map((segment) => decodeURIComponent(segment)).join("/");

  if (!isValidCrmMediaKey(key)) {
    return NextResponse.json({ error: "Invalid media path." }, { status: 400 });
  }

  const asset = await readCrmMediaObject(key);

  if (!asset) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(asset.body), {
    headers: {
      "Content-Type": asset.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}