import { NextRequest, NextResponse } from "next/server";
import { COLUMNS_BY_KEY } from "@/lib/columns";
import {
  appendRecord,
  ensureSheetReady,
  findRowByNo,
  readAllRecords,
} from "@/lib/sheet";
import { generateRecordNo, nowStamp } from "@/lib/id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/data-input
 * Returns all records, soft-deleted rows excluded by default. Pass
 * `?includeDeleted=1` to include them.
 */
export async function GET(request: NextRequest) {
  await ensureSheetReady();
  const includeDeleted =
    request.nextUrl.searchParams.get("includeDeleted") === "1";
  const all = await readAllRecords();
  const filtered = includeDeleted
    ? all
    : all.filter((r) => r.isDeleted !== "TRUE");
  return NextResponse.json({ data: filtered });
}

/**
 * POST /api/data-input
 * Create a new record. The body should be a JSON object keyed by the field
 * keys defined in `lib/columns.ts`. The system fills NO, audit timestamps,
 * and validation status.
 */
export async function POST(request: NextRequest) {
  await ensureSheetReady();
  const body = (await request.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  if (!body) {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!COLUMNS_BY_KEY[key]) continue; // ignore unknown keys
    record[key] = value == null ? "" : String(value);
  }

  // System-managed fields (always overwritten on create).
  const now = new Date();
  // Honor a client-supplied NO when it is well-formed AND not yet taken.
  // Otherwise fall back to a server-generated id. This lets the form upload
  // photos to a Drive folder named after the final NO.
  const requestedNo =
    typeof body.no === "string" && /^ID\d{8}-\d{6}$/.test(body.no)
      ? body.no
      : null;
  let no = requestedNo;
  if (no) {
    const existing = await findRowByNo(no);
    if (existing) no = null;
  }
  record.no = no ?? generateRecordNo(now);
  record.tanggalSubmit = nowStamp(now);
  record.inputBy =
    record.inputBy || (typeof body.inputBy === "string" ? body.inputBy : "anon");
  record.inputAt = nowStamp(now);
  record.updatedBy = record.inputBy;
  record.updatedAt = nowStamp(now);
  record.validationStatus = record.validationStatus || "MENUNGGU_VALIDASI";
  record.validasi = record.validasi || record.validationStatus;
  record.isDeleted = "FALSE";

  await appendRecord(record);
  return NextResponse.json({ data: record }, { status: 201 });
}
