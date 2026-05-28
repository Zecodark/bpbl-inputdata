import "server-only";
import { getSheets, getSheetId } from "./google";
import { readAllRecords } from "./sheet";

/**
 * One row of the rekap table. When a target tab is present in the spreadsheet
 * we source as many numbers as possible from it, otherwise we fall back to
 * counts derived from DATA INPUT.
 */
export type RekapRow = {
  key: string;
  /** For per-ULP rows this is the parent UP3 (when known). */
  group?: string;
  jumlahPelanggan: number | null;
  sudahPerbaikanSlo: number | null;
  sudahDiperiksa: number | null;
  belumDiperiksa: number | null;
  /** 0..1, always derived from sudahDiperiksa / jumlahPelanggan. */
  persentase: number | null;
};

export type RekapBundle = {
  perUlp: RekapRow[];
  perMitra: RekapRow[];
  perUp3: RekapRow[];
  totals: {
    jumlahPelanggan: number | null;
    sudahPerbaikanSlo: number | null;
    sudahDiperiksa: number | null;
    belumDiperiksa: number | null;
    persentase: number | null;
  };
  /** Diagnostics surfaced in the UI when a target tab can't be found. */
  diagnostics: {
    ulp: { resolvedTab?: string; reason?: string };
    mitra: { resolvedTab?: string; reason?: string };
    availableTabs: string[];
  };
};

/** Optional explicit overrides, if the user prefers to pin a tab name. */
const TARGET_ULP_HINT =
  process.env.GOOGLE_SHEET_TARGET_ULP_TAB?.trim() || undefined;
const TARGET_MITRA_HINT =
  process.env.GOOGLE_SHEET_TARGET_MITRA_TAB?.trim() || undefined;

/** Trim, collapse internal whitespace, uppercase. */
function norm(value: string | undefined | null): string {
  return (value ?? "").toString().trim().replace(/\s+/g, " ").toUpperCase();
}

/** Tolerant numeric parser. Accepts plain numbers, "1,229", "1.270", "55.32%". */
function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  let s = String(value).trim();
  if (!s) return null;
  if (s === "—" || s === "-" || s === "–") return null;
  const isPercent = s.endsWith("%");
  s = s.replace(/[%]/g, "");
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    const lastDot = s.lastIndexOf(".");
    const lastComma = s.lastIndexOf(",");
    if (lastDot > lastComma) {
      s = s.replace(/,/g, "");
    } else {
      s = s.replace(/\./g, "").replace(",", ".");
    }
  } else if (hasComma) {
    s = s.replace(/,/g, "");
  } else if (hasDot) {
    const parts = s.split(".");
    if (parts.length === 2 && parts[1].length === 3 && !isPercent) {
      s = parts.join("");
    }
  }
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  return isPercent ? n / 100 : n;
}

type ParsedTarget = {
  group?: string;
  jumlahPelanggan: number | null;
  sudahPerbaikanSlo: number | null;
  sudahDiperiksa: number | null;
  belumDiperiksa: number | null;
};

type TargetMap = Map<string, ParsedTarget>;

type TabValues = { title: string; rows: unknown[][] };

/** Read every tab's first 1000 rows in a single batch call. */
async function readAllTabs(): Promise<TabValues[]> {
  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const titles =
    meta.data.sheets
      ?.map((s) => s.properties?.title)
      .filter((t): t is string => Boolean(t)) ?? [];
  if (titles.length === 0) return [];
  const ranges = titles.map((t) => `${t}!A1:Z2000`);
  const resp = await sheets.spreadsheets.values.batchGet({
    spreadsheetId,
    ranges,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const out: TabValues[] = [];
  resp.data.valueRanges?.forEach((vr, i) => {
    out.push({
      title: titles[i],
      rows: (vr.values as unknown[][] | undefined) ?? [],
    });
  });
  return out;
}

/**
 * Locate every row that looks like the requested header. Returns one entry per
 * matching block so a single tab can host multiple rekap tables stacked on top
 * of each other (e.g. ULP block followed by Mitra block).
 */
function locateAllHeaderRows(
  rows: unknown[][],
  headerCandidates: { name: string; aliases: string[] }[],
): { headerRow: number; resolved: Map<string, number> }[] {
  const results: { headerRow: number; resolved: Map<string, number> }[] = [];
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const normHeader = row.map((v) => norm(String(v ?? "")));
    const resolved = new Map<string, number>();
    for (const cand of headerCandidates) {
      const targets = cand.aliases.map(norm);
      const idx = normHeader.findIndex((h) => targets.includes(h));
      if (idx >= 0) resolved.set(cand.name, idx);
    }
    if (resolved.size === headerCandidates.length) {
      results.push({ headerRow: r, resolved });
    }
  }
  return results;
}

const ULP_HEADERS = [
  { name: "primary", aliases: ["ULP", "UNIT TUJUAN", "UNIT", "ULP TUJUAN"] },
  { name: "target", aliases: ["JUMLAH PELANGGAN", "TARGET", "TOTAL PELANGGAN"] },
];
const MITRA_HEADERS = [
  { name: "primary", aliases: ["MITRA", "BANGSANG", "PT", "VENDOR"] },
  { name: "target", aliases: ["JUMLAH PELANGGAN", "TARGET", "TOTAL PELANGGAN"] },
];

const OPTIONAL_HEADERS = [
  {
    name: "group",
    aliases: ["UP3", "UP3 TUJUAN"],
  },
  {
    name: "slo",
    aliases: [
      "SUDAH PERBAIKAN SLO",
      "SUDAH KIRIM PERBAIKAN SLO",
      "PERBAIKAN SLO",
    ],
  },
  {
    name: "checked",
    aliases: [
      "SUDAH DIPERIKSA ON-SITE",
      "SUDAH DIPERIKSA ONSITE",
      "SUDAH DIPERIKSA",
      "SUDAH PEMERIKSAAN",
    ],
  },
  {
    name: "notChecked",
    aliases: [
      "BELUM DIPERIKSA ON-SITE",
      "BELUM DIPERIKSA ONSITE",
      "BELUM DIPERIKSA",
    ],
  },
];

/**
 * Parse one block (header + the rows below it) into a target map. Stops when
 * the primary cell is empty for two consecutive rows, signalling end of block.
 */
function parseBlock(
  rows: unknown[][],
  headerRow: number,
  resolved: Map<string, number>,
): TargetMap {
  const headerCells = (rows[headerRow] ?? []).map((v) =>
    norm(String(v ?? "")),
  );
  const optional = new Map<string, number>();
  for (const opt of OPTIONAL_HEADERS) {
    const targets = opt.aliases.map(norm);
    const idx = headerCells.findIndex((h) => targets.includes(h));
    if (idx >= 0) optional.set(opt.name, idx);
  }

  const primaryIdx = resolved.get("primary")!;
  const targetIdx = resolved.get("target")!;
  const groupIdx = optional.get("group");
  const sloIdx = optional.get("slo");
  const checkedIdx = optional.get("checked");
  const notCheckedIdx = optional.get("notChecked");

  const map: TargetMap = new Map();
  let blanks = 0;
  for (let i = headerRow + 1; i < rows.length; i++) {
    const row = rows[i] ?? [];
    const rawKey = String(row[primaryIdx] ?? "").trim();
    if (!rawKey) {
      blanks++;
      if (blanks >= 2) break;
      continue;
    }
    blanks = 0;
    const key = norm(rawKey);
    if (key === "TOTAL" || key.startsWith("TOTAL ")) continue;
    const target = parseNumber(row[targetIdx]);
    if (target === null) continue;

    map.set(key, {
      group:
        groupIdx !== undefined
          ? String(row[groupIdx] ?? "").trim() || undefined
          : undefined,
      jumlahPelanggan: target,
      sudahPerbaikanSlo:
        sloIdx !== undefined ? parseNumber(row[sloIdx]) : null,
      sudahDiperiksa:
        checkedIdx !== undefined ? parseNumber(row[checkedIdx]) : null,
      belumDiperiksa:
        notCheckedIdx !== undefined ? parseNumber(row[notCheckedIdx]) : null,
    });
  }
  return map;
}

/**
 * Scan a tab for every block matching the requested shape and merge them.
 * This way a single sheet hosting both an ULP and a Mitra rekap can supply
 * separate target maps when called twice with different header rules.
 */
function parseTargetTab(
  tab: TabValues,
  required: { name: string; aliases: string[] }[],
): TargetMap | null {
  const blocks = locateAllHeaderRows(tab.rows, required);
  if (blocks.length === 0) return null;
  const merged: TargetMap = new Map();
  for (const block of blocks) {
    const data = parseBlock(tab.rows, block.headerRow, block.resolved);
    for (const [k, v] of data) merged.set(k, v);
  }
  return merged.size > 0 ? merged : null;
}

function findTargetTab(
  tabs: TabValues[],
  required: { name: string; aliases: string[] }[],
  hint: string | undefined,
): { tab: string; data: TargetMap } | null {
  // 1. If the user hinted a tab name, try it first (tolerant matching).
  if (hint) {
    const hintNorm = norm(hint);
    const hinted = tabs.find((t) => norm(t.title) === hintNorm);
    if (hinted) {
      const data = parseTargetTab(hinted, required);
      if (data) return { tab: hinted.title, data };
    }
  }
  // 2. Auto-detect: take the first tab whose header row matches our required
  //    column shape.
  for (const tab of tabs) {
    const data = parseTargetTab(tab, required);
    if (data) return { tab: tab.title, data };
  }
  return null;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const k = keyFn(item);
    const list = out.get(k);
    if (list) list.push(item);
    else out.set(k, [item]);
  }
  return out;
}

function safeDiv(num: number | null, denom: number | null): number | null {
  if (num === null || denom === null || denom <= 0) return null;
  return num / denom;
}

function sumOrNull(
  rows: RekapRow[],
  pick: (r: RekapRow) => number | null,
): number | null {
  let sum = 0;
  let any = false;
  for (const r of rows) {
    const v = pick(r);
    if (v !== null) {
      sum += v;
      any = true;
    }
  }
  return any ? sum : null;
}

export async function buildRekap(): Promise<RekapBundle> {
  const records = (await readAllRecords()).filter(
    (r) => r.isDeleted !== "TRUE",
  );

  let tabs: TabValues[] = [];
  try {
    tabs = await readAllTabs();
  } catch {
    tabs = [];
  }

  const ulpFound = findTargetTab(tabs, ULP_HEADERS, TARGET_ULP_HINT);
  const mitraFound = findTargetTab(tabs, MITRA_HEADERS, TARGET_MITRA_HINT);

  const ulpTargets = ulpFound?.data ?? null;
  const mitraTargets = mitraFound?.data ?? null;

  const recordsByUlp = groupBy(records, (r) => norm(r.unitTujuan));
  const recordsByUp3FromInput = groupBy(records, (r) => norm(r.up3Tujuan));
  const recordsByMitra = groupBy(records, (r) => norm(r.mitra));

  // ---------- per ULP ----------
  const ulpKeys = new Set<string>([
    ...recordsByUlp.keys(),
    ...(ulpTargets?.keys() ?? []),
  ]);
  const perUlp: RekapRow[] = [];
  for (const key of ulpKeys) {
    if (!key) continue;
    const list = recordsByUlp.get(key) ?? [];
    const target = ulpTargets?.get(key);

    const sudahDiperiksaFromInput = list.length;
    const sudahPerbaikanSloFromInput = list.filter(
      (r) => norm(r.sloPenyerahan) === "DITERIMA",
    ).length;

    const jumlahPelanggan = target?.jumlahPelanggan ?? null;
    const sudahDiperiksa =
      target?.sudahDiperiksa ?? sudahDiperiksaFromInput;
    const sudahPerbaikanSlo =
      target?.sudahPerbaikanSlo ?? sudahPerbaikanSloFromInput;
    const belumDiperiksa =
      target?.belumDiperiksa ??
      (jumlahPelanggan !== null
        ? Math.max(jumlahPelanggan - sudahDiperiksa, 0)
        : null);

    perUlp.push({
      key,
      group: target?.group ?? list[0]?.up3Tujuan?.trim() ?? undefined,
      jumlahPelanggan,
      sudahPerbaikanSlo,
      sudahDiperiksa,
      belumDiperiksa,
      persentase: safeDiv(sudahDiperiksa, jumlahPelanggan),
    });
  }
  perUlp.sort((a, b) => a.key.localeCompare(b.key));

  // ---------- per UP3 (aggregate from per-ULP) ----------
  const perUp3Map = new Map<string, RekapRow[]>();
  for (const r of perUlp) {
    const g = r.group?.trim() || "—";
    const existing = perUp3Map.get(g);
    if (existing) existing.push(r);
    else perUp3Map.set(g, [r]);
  }
  const perUp3: RekapRow[] = [];
  for (const [g, list] of perUp3Map) {
    const jumlahPelanggan = sumOrNull(list, (r) => r.jumlahPelanggan);
    const sudahPerbaikanSlo = sumOrNull(list, (r) => r.sudahPerbaikanSlo);
    const sudahDiperiksa = sumOrNull(list, (r) => r.sudahDiperiksa);
    const belumDiperiksa =
      jumlahPelanggan !== null && sudahDiperiksa !== null
        ? Math.max(jumlahPelanggan - sudahDiperiksa, 0)
        : sumOrNull(list, (r) => r.belumDiperiksa);
    perUp3.push({
      key: g,
      jumlahPelanggan,
      sudahPerbaikanSlo,
      sudahDiperiksa,
      belumDiperiksa,
      persentase: safeDiv(sudahDiperiksa, jumlahPelanggan),
    });
  }
  perUp3.sort((a, b) => a.key.localeCompare(b.key));

  if (perUp3.length === 0 && recordsByUp3FromInput.size > 0) {
    for (const [up3, list] of recordsByUp3FromInput) {
      if (!up3) continue;
      perUp3.push({
        key: up3,
        jumlahPelanggan: null,
        sudahPerbaikanSlo: list.filter(
          (r) => norm(r.sloPenyerahan) === "DITERIMA",
        ).length,
        sudahDiperiksa: list.length,
        belumDiperiksa: null,
        persentase: null,
      });
    }
  }

  // ---------- per Mitra ----------
  const mitraKeys = new Set<string>([
    ...recordsByMitra.keys(),
    ...(mitraTargets?.keys() ?? []),
  ]);
  const perMitra: RekapRow[] = [];
  for (const key of mitraKeys) {
    if (!key) continue;
    const list = recordsByMitra.get(key) ?? [];
    const target = mitraTargets?.get(key);
    const sudahDiperiksaFromInput = list.length;
    const sudahPerbaikanSloFromInput = list.filter(
      (r) => norm(r.sloPenyerahan) === "DITERIMA",
    ).length;

    const jumlahPelanggan = target?.jumlahPelanggan ?? null;
    const sudahDiperiksa =
      target?.sudahDiperiksa ?? sudahDiperiksaFromInput;
    const sudahPerbaikanSlo =
      target?.sudahPerbaikanSlo ?? sudahPerbaikanSloFromInput;
    const belumDiperiksa =
      target?.belumDiperiksa ??
      (jumlahPelanggan !== null
        ? Math.max(jumlahPelanggan - sudahDiperiksa, 0)
        : null);

    perMitra.push({
      key,
      jumlahPelanggan,
      sudahPerbaikanSlo,
      sudahDiperiksa,
      belumDiperiksa,
      persentase: safeDiv(sudahDiperiksa, jumlahPelanggan),
    });
  }
  perMitra.sort((a, b) => a.key.localeCompare(b.key));

  // ---------- Totals ----------
  const totalJumlah = sumOrNull(perUlp, (r) => r.jumlahPelanggan);
  const totalSlo = sumOrNull(perUlp, (r) => r.sudahPerbaikanSlo);
  const totalDiperiksa = sumOrNull(perUlp, (r) => r.sudahDiperiksa);
  const totalBelum =
    totalJumlah !== null && totalDiperiksa !== null
      ? Math.max(totalJumlah - totalDiperiksa, 0)
      : sumOrNull(perUlp, (r) => r.belumDiperiksa);

  const totals = {
    jumlahPelanggan: totalJumlah,
    sudahPerbaikanSlo: totalSlo,
    sudahDiperiksa: totalDiperiksa,
    belumDiperiksa: totalBelum,
    persentase: safeDiv(totalDiperiksa, totalJumlah),
  };

  return {
    perUlp,
    perMitra,
    perUp3,
    totals,
    diagnostics: {
      ulp: {
        resolvedTab: ulpFound?.tab,
        reason: ulpFound
          ? undefined
          : "Tidak ada tab yang punya kolom ULP + JUMLAH PELANGGAN",
      },
      mitra: {
        resolvedTab: mitraFound?.tab,
        reason: mitraFound
          ? undefined
          : "Tidak ada tab yang punya kolom MITRA/BANGSANG + JUMLAH PELANGGAN",
      },
      availableTabs: tabs.map((t) => t.title),
    },
  };
}
