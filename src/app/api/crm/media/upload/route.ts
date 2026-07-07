import { type NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/crm/auth";
import { uploadCrmMediaFile } from "@/lib/crm/media-upload";

export const runtime = "nodejs";

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

    const result = await uploadCrmMediaFile(
      file,
      folder === "notices" ? "notices" : "blog",
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[crm/media/upload] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 500 },
    );
  }
}
