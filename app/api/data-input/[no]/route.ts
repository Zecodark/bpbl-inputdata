import { NextRequest, NextResponse } from "next/server";
import { COLUMNS_BY_KEY } from "@/lib/columns";
import { ensureSheetReady, findRowByNo, patchRecord } from "@/lib/sheet";
import { nowStamp } from "@/lib/id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/data-input/[no]">,
) {
  await ensureSheetReady();
  const { no } = await ctx.params;
  const found = await findRowByNo(no);
  if (!found) {
    return NextResponse.json({ error: "Data tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({ data: found.record });
}

/**
 * Patch an existing record. The body should be `{ patch: { ... }, actor?: string }`.
 * Only known field keys are accepted; system fields are still rewritten with
 * fresh `updatedBy` / `updatedAt`.
 */
export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/data-input/[no]">,
) {
  await ensureSheetReady();
  const { no } = await ctx.params;
  const body = (await request.json().catch(() => null)) as
    | { patch?: Record<string, unknown>; actor?: string }
    | null;
  if (!body || typeof body.patch !== "object" || body.patch == null) {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  for (const [key, value] of Object.entries(body.patch)) {
    if (!COLUMNS_BY_KEY[key]) continue;
    patch[key] = value == null ? "" : String(value);
  }
  patch.updatedBy = body.actor || patch.updatedBy || "anon";
  patch.updatedAt = nowStamp();

  const merged = await patchRecord(no, patch);
  return NextResponse.json({ data: merged });
}

/**
 * Soft-delete by default. Pass `?hard=1` only if you really want a destructive
 * row delete (not implemented; kept disabled for safety).
 */
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/data-input/[no]">,
) {
  await ensureSheetReady();
  const { no } = await ctx.params;
  const actor = request.nextUrl.searchParams.get("actor") || "anon";
  const merged = await patchRecord(no, {
    isDeleted: "TRUE",
    deletedBy: actor,
    deletedAt: nowStamp(),
    updatedBy: actor,
    updatedAt: nowStamp(),
  });
  return NextResponse.json({ data: merged });
}
