import { NextRequest, NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/drive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

/**
 * POST /api/upload (multipart/form-data)
 * fields:
 *   - file: image to upload (required)
 *   - no:   record NO, used as the Drive sub-folder name
 *   - slug: photo column slug, e.g. "foto_mcb"
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
    return NextResponse.json(
      { error: "Parameter `no` wajib diisi" },
      { status: 400 },
    );
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
    return NextResponse.json(
      { error: "Hanya gambar yang diizinkan" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadPhoto({
      no,
      slug,
      buffer,
      mimeType: file.type,
      originalName: file.name,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    // Surface the real Drive error back to the form so the operator can act
    // on it (folder not shared, Shared Drive permission denied, quota, …).
    const message = formatDriveError(err);
    console.error("[/api/upload] Drive error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatDriveError(err: unknown): string {
  if (!err) return "Upload ke Drive gagal";
  if (typeof err === "string") return err;
  // googleapis errors carry the API message in either `errors[].message`,
  // `response.data.error.message`, or `message`.
  const e = err as {
    message?: string;
    code?: number | string;
    errors?: { message?: string; reason?: string }[];
    response?: { data?: { error?: { message?: string; code?: number } } };
  };
  const apiMsg =
    e.response?.data?.error?.message ??
    e.errors?.[0]?.message ??
    e.message ??
    "Upload ke Drive gagal";
  const reason = e.errors?.[0]?.reason;
  // Hint at the most common root causes so the user knows what to fix.
  const hint = inferHint(apiMsg, reason);
  return hint ? `${apiMsg} — ${hint}` : apiMsg;
}

function inferHint(message: string, reason?: string): string | null {
  const m = message.toLowerCase();
  if (
    m.includes("permission") ||
    m.includes("forbidden") ||
    reason === "forbidden"
  ) {
    return "Pastikan email service account sudah ditambahkan sebagai Editor pada folder Drive tujuan (atau pada Shared Drive yang menampungnya).";
  }
  if (m.includes("not found") || reason === "notFound") {
    return "ID folder Drive tidak ditemukan. Periksa GOOGLE_DRIVE_FOLDER_ID di .env.local.";
  }
  if (m.includes("storage quota")) {
    return "Akun service account tidak punya kuota My Drive — gunakan folder yang berada di dalam Shared Drive.";
  }
  if (m.includes("file is not readable")) {
    return "Drive menolak file. Coba kompres atau gunakan format JPG/PNG.";
  }
  return null;
}
