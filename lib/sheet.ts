import "server-only";
import { getSheets, getSheetId, getSheetTab } from "./google";
import {
  COLUMNS,
  HEADER_ROW,
  LAST_COL_LETTER,
  indexToCol,
  type RowRecord,
} from "./columns";

/**
 * Cached column layout. We read the actual header row from the spreadsheet
 * once per process so the app keeps working even when the operator added,
 * reordered, or renamed columns. Each schema column is mapped to the column
 * index where its header lives in the sheet (1-based, or null when absent).
 */
type Layout = {
  /** Effective number of columns to read from / write to. */
  columnCount: number;
  /** schema-key → 0-based column index, undefined when the header is missing. */
  keyToIndex: Map<string, number>;
};

let cachedLayout: Layout | null = null;

function normHeader(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

async function getLayout(): Promise<Layout> {
  if (cachedLayout) return cachedLayout;

  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find((s) => s.properties?.title === tab);
  const gridCols =
    existing?.properties?.gridProperties?.columnCount ?? COLUMNS.length;

  // Read the actual header row.
  const headerResp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!1:1`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const headers: string[] = (headerResp.data.values?.[0] ?? []).map((v) =>
    normHeader(v),
  );

  const keyToIndex = new Map<string, number>();
  for (const c of COLUMNS) {
    const wanted = normHeader(c.header);
    let idx = headers.findIndex((h) => h === wanted);
    if (idx < 0) {
      // Fallback to schema position when the spreadsheet has no header row at
      // all (typical on a freshly created tab).
      if (headers.length === 0) idx = c.index - 1;
    }
    if (idx >= 0) keyToIndex.set(c.key, idx);
  }

  // The effective column count is the largest column we actually need to
  // touch (1-based). Capped to the grid width to avoid out-of-range writes.
  let maxIdx = 0;
  for (const idx of keyToIndex.values()) if (idx + 1 > maxIdx) maxIdx = idx + 1;
  if (maxIdx === 0) maxIdx = Math.min(gridCols, COLUMNS.length);
  const columnCount = Math.min(Math.max(maxIdx, headers.length), gridCols);

  cachedLayout = { columnCount, keyToIndex };
  return cachedLayout;
}

/** Reset the layout cache (used by ensureSheetReady when a tab is created). */
function invalidateLayout() {
  cachedLayout = null;
}

/**
 * Make sure the `DATA INPUT` tab exists. When the tab is missing we create it
 * and seed the header row with the schema. Existing tabs are left untouched —
 * we adapt to whatever header layout they have.
 */
export async function ensureSheetReady(): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existing = meta.data.sheets?.find((s) => s.properties?.title === tab);
  if (existing) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: tab,
              gridProperties: { rowCount: 1000, columnCount: COLUMNS.length },
            },
          },
        },
      ],
    },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${tab}!A1:${LAST_COL_LETTER}1`,
    valueInputOption: "RAW",
    requestBody: { values: [HEADER_ROW] },
  });
  invalidateLayout();
}

/** Decode a sheet row into a typed record using the cached header layout. */
function rowToRecordLayout(row: ReadonlyArray<unknown>, layout: Layout): RowRecord {
  const rec: RowRecord = {};
  for (const c of COLUMNS) {
    const idx = layout.keyToIndex.get(c.key);
    if (idx === undefined) {
      rec[c.key] = "";
      continue;
    }
    const v = row[idx];
    rec[c.key] = v === undefined || v === null ? "" : String(v);
  }
  return rec;
}

/** Read every data row, decoded into typed records. */
export async function readAllRecords(): Promise<RowRecord[]> {
  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();
  const layout = await getLayout();
  const last = indexToCol(layout.columnCount);

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A2:${last}`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = resp.data.values ?? [];
  return rows.map((r) => rowToRecordLayout(r, layout));
}

/**
 * Find the absolute row index (1-based, header included) for a given NO.
 * Returns null when not found.
 */
export async function findRowByNo(no: string): Promise<{
  rowIndex: number;
  record: RowRecord;
} | null> {
  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();
  const layout = await getLayout();
  const last = indexToCol(layout.columnCount);
  const noIdx = layout.keyToIndex.get("no") ?? 0;
  const noColLetter = indexToCol(noIdx + 1);

  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A2:${last}`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const rows = resp.data.values ?? [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row && String(row[noIdx] ?? "").trim() === no) {
      return { rowIndex: i + 2, record: rowToRecordLayout(row, layout) };
    }
  }
  // noColLetter referenced to keep the variable used in case Sheets API ever
  // requires a narrower scan.
  void noColLetter;
  return null;
}

/**
 * Build a row aligned to the actual header order. Cells whose header is
 * missing in the sheet are dropped silently.
 */
function recordToRowLayout(record: RowRecord, layout: Layout): unknown[] {
  const row: unknown[] = new Array(layout.columnCount).fill("");
  for (const c of COLUMNS) {
    const idx = layout.keyToIndex.get(c.key);
    if (idx === undefined) continue;
    if (idx >= layout.columnCount) continue;
    row[idx] = record[c.key] ?? "";
  }
  return row;
}

/** Append a brand new row to the bottom of the sheet. */
export async function appendRecord(record: RowRecord): Promise<void> {
  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();
  const layout = await getLayout();
  const last = indexToCol(layout.columnCount);
  const row = recordToRowLayout(record, layout);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${tab}!A:${last}`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

/**
 * Patch a subset of fields on the row identified by NO. Pass only the keys
 * you want to overwrite; everything else is left intact.
 *
 * Implementation note: instead of rewriting the entire row (which would clobber
 * any sheet-only columns we don't track in the schema), we update each touched
 * field's cell individually.
 */
export async function patchRecord(
  no: string,
  patch: Partial<RowRecord>,
): Promise<RowRecord> {
  const found = await findRowByNo(no);
  if (!found) throw new Error(`Data dengan NO ${no} tidak ditemukan`);

  const sheets = getSheets();
  const spreadsheetId = getSheetId();
  const tab = getSheetTab();
  const layout = await getLayout();

  const data: { range: string; values: string[][] }[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (k === "no") continue; // protect primary key
    const idx = layout.keyToIndex.get(k);
    if (idx === undefined) continue;
    const colLetter = indexToCol(idx + 1);
    data.push({
      range: `${tab}!${colLetter}${found.rowIndex}`,
      values: [[String(v)]],
    });
  }
  if (data.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      requestBody: { valueInputOption: "RAW", data },
    });
  }

  const merged: RowRecord = { ...found.record };
  for (const [k, v] of Object.entries(patch)) {
    if (v !== undefined) merged[k] = v;
  }
  merged.no = found.record.no;
  return merged;
}
