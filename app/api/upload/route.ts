import { NextRequest, NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/upload (multipart/form-data)
 * fields:
 *   - file: the image to upload (required)
 *   - no:   the record NO (used to scope a Drive sub-folder)
 *   - slug: short identifier for the photo column (e.g. "foto_mcb")
 */
export async function POST(request: NextRequest) {
  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Form tidak valid" }, { status: 400 });
  }

  const file = form.get("file");
  const no = String(form.get("no") ?? "").trim();
  const slug = String(form.get("slug") ?? "foto").trim() || "foto";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!no) {
    return NextResponse.json({ error: "Parameter `no` wajib diisi" }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "File kosong" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Ukuran file melebihi 10 MB" },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Hanya gambar yang diizinkan" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadPhoto({
    no,
    slug,
    buffer,
    mimeType: file.type,
    originalName: file.name,
  });

  return NextResponse.json({ data: result });
}
