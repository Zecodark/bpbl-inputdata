// Single source of truth for the DATA INPUT sheet schema.
// Every column in tab `DATA INPUT` is declared once here and consumed by the
// form, the API serialization layer, and the listing/detail UIs.

export type FieldType =
  | "id" // primary key NO
  | "datetime" // ISO datetime stored as string
  | "text" // free text / brand
  | "number-text" // numeric content stored as text (preserves leading zeros)
  | "longtext" // multi-line note
  | "enum" // controlled vocabulary
  | "photo" // Google Drive fileId / URL
  | "coord" // "lat, lng"
  | "audit" // audit/validation columns (read-mostly)

export type EnumKind =
  | "SESUAI_TIDAK"
  | "TERPASANG_TIDAK"
  | "SESUAI_ONLY"
  | "DITERIMA"
  | "VALIDATION_STATUS"
  | "BOOL"

export type ColumnDef = {
  /** Spreadsheet column letter, e.g. "A", "AC", "CC" */
  col: string;
  /** Numeric column index, 1-based */
  index: number;
  /** Stable machine-friendly key used in JSON payloads */
  key: string;
  /** Header label shown in the spreadsheet (must match exactly) */
  header: string;
  /** Human label for the form */
  label: string;
  type: FieldType;
  enumKind?: EnumKind;
  /** Section grouping for the form */
  section: string;
  /** Optional placeholder/help text */
  hint?: string;
  /** When true, hidden in the create/edit form (set by the system) */
  systemManaged?: boolean;
};

export const ENUM_OPTIONS: Record<EnumKind, string[]> = {
  SESUAI_TIDAK: ["SESUAI", "TIDAK"],
  TERPASANG_TIDAK: ["TERPASANG", "TIDAK"],
  SESUAI_ONLY: ["SESUAI"],
  DITERIMA: ["DITERIMA", "BELUM DITERIMA", "TIDAK ADA"],
  VALIDATION_STATUS: [
    "DRAFT",
    "MENUNGGU_VALIDASI",
    "VALID",
    "PERLU_REVISI",
    "DITOLAK",
  ],
  BOOL: ["TRUE", "FALSE"],
};

/** Convert a 1-based index to spreadsheet column letters (1 -> A, 27 -> AA). */
export function indexToCol(n: number): string {
  let s = "";
  let x = n;
  while (x > 0) {
    const r = (x - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

/** Convert spreadsheet column letters back to a 1-based index. */
export function colToIndex(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

const SECTION = {
  IDENTITAS: "1. Data Pelanggan",
  MCB: "2. MCB",
  KSU: "3. Kabel Sirkit Utama (KSU)",
  KKK: "4. Kabel Kotak Kontak",
  KST: "5. Kabel Sakelar Tunggal",
  KSG: "6. Kabel Sakelar Ganda",
  KL: "7. Kabel Lampu",
  ROSET: "8. Roset, T-Dos, Klem",
  LAMPU: "9. Lampu",
  KK: "10. Kotak Kontak",
  ST: "11. Sakelar Tunggal",
  SG: "12. Sakelar Ganda",
  FL: "13. Fitting Lampu",
  ER: "14. Earthing Rod",
  EK: "15. Earthing Konduktor",
  STIKER: "16. Stiker",
  SLO: "17. Dokumen SLO",
  TAMBAHAN: "18. Tambahan & Koordinat",
  AUDIT: "19. Audit & Validasi",
} as const;

// Build the schema with col letter inferred from declared order so future edits
// don't drift between letter and index.
type Spec = Omit<ColumnDef, "col" | "index">;

const SPEC: Spec[] = [
  // ---- Identitas / Pelanggan ----
  { key: "no", header: "NO", label: "NO (ID)", type: "id", section: SECTION.IDENTITAS, systemManaged: true, hint: "ID otomatis, format ID<YYYYMMDD-HHMMSS>" },
  { key: "tanggalSubmit", header: "TANGGAL_SUBMIT", label: "Tanggal Submit", type: "datetime", section: SECTION.IDENTITAS, systemManaged: true },
  { key: "noMeter", header: "NO METER", label: "NO METER", type: "number-text", section: SECTION.IDENTITAS },
  { key: "idpel", header: "IDPEL", label: "IDPEL", type: "number-text", section: SECTION.IDENTITAS },
  { key: "nik", header: "NIK", label: "NIK", type: "number-text", section: SECTION.IDENTITAS },
  { key: "nama", header: "NAMA", label: "Nama", type: "text", section: SECTION.IDENTITAS },
  { key: "alamat", header: "ALAMAT", label: "Alamat", type: "longtext", section: SECTION.IDENTITAS },
  { key: "kabupatenKota", header: "KABUPATENKOTA", label: "Kabupaten/Kota", type: "text", section: SECTION.IDENTITAS },
  { key: "kecamatan", header: "KECAMATAN", label: "Kecamatan", type: "text", section: SECTION.IDENTITAS },
  { key: "desaKelurahan", header: "DESAKELURAHAN", label: "Desa/Kelurahan", type: "text", section: SECTION.IDENTITAS },
  { key: "noNidi", header: "NO_NIDI", label: "NO NIDI", type: "text", section: SECTION.IDENTITAS },
  { key: "noSlo", header: "NOSLO", label: "NO SLO", type: "text", section: SECTION.IDENTITAS },
  { key: "mitra", header: "MITRA", label: "Mitra", type: "text", section: SECTION.IDENTITAS },
  { key: "unitTujuan", header: "UNIT TUJUAN", label: "Unit Tujuan", type: "text", section: SECTION.IDENTITAS },
  { key: "up3Tujuan", header: "UP3 TUJUAN", label: "UP3 Tujuan", type: "text", section: SECTION.IDENTITAS },

  // ---- 1. MCB ----
  { key: "mcbMerk", header: "1. MERK MCB", label: "Merk MCB", type: "text", section: SECTION.MCB },
  { key: "mcb10A", header: "1. MCB 10 A", label: "MCB 10 A", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.MCB },
  { key: "mcbKet", header: "1. KET MCB", label: "Keterangan MCB", type: "longtext", section: SECTION.MCB },
  { key: "mcbFoto", header: "1. FOTO MCB", label: "Foto MCB", type: "photo", section: SECTION.MCB },

  // ---- 2. KSU ----
  { key: "ksuMerk", header: "2. MERK KABEL SIRKIT UTAMA (KSU) ", label: "Merk Kabel Sirkit Utama (KSU)", type: "text", section: SECTION.KSU },
  { key: "ksuUkuran", header: "2. UKURAN KSU MIN 3 X 4 MM", label: "Ukuran KSU min 3 x 4 mm", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.KSU },
  { key: "ksuPanjang", header: "2. PANJANG KSU 1 METER", label: "Panjang KSU 1 meter", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KSU },
  { key: "ksuKet", header: "2. KET KSU", label: "Keterangan KSU", type: "longtext", section: SECTION.KSU },
  { key: "ksuFoto", header: "2. FOTO KABEL SIRKIT UTAMA", label: "Foto Kabel Sirkit Utama", type: "photo", section: SECTION.KSU },

  // ---- 3. Kabel Kotak Kontak ----
  { key: "kkkMerk", header: "3. MERK KABEL KOTAK KONTAK", label: "Merk Kabel Kotak Kontak", type: "text", section: SECTION.KKK },
  { key: "kkkUkuran", header: "3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM", label: "Ukuran Kabel Kotak Kontak min 3x2.5 mm", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KKK },
  { key: "kkkPanjang", header: "3. PANJANG KABEL KOTAK KONTAK 7 M", label: "Panjang Kabel Kotak Kontak 7 m", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KKK },
  { key: "kkkKet", header: "3. KET KABEL KOTAK KONTAK", label: "Keterangan Kabel Kotak Kontak", type: "longtext", section: SECTION.KKK },
  { key: "kkkFoto", header: "3. FOTO KABEL KOTAK KONTAK", label: "Foto Kabel Kotak Kontak", type: "photo", section: SECTION.KKK },

  // ---- 4. Kabel Sakelar Tunggal ----
  { key: "kstMerk", header: "4. MERK KABEL SAKELAR TUNGGAL", label: "Merk Kabel Sakelar Tunggal", type: "text", section: SECTION.KST },
  { key: "kstUkuran", header: "4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM", label: "Ukuran 2x1.5 mm", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KST },
  { key: "kstPanjang", header: "4. KABEL SAKELAR TUNGGAL PANJANG 3 M", label: "Panjang 3 m", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KST },
  { key: "kstKet", header: "4. KET KABEL SAKELAR TUNGGAL", label: "Keterangan", type: "longtext", section: SECTION.KST },
  { key: "kstFoto", header: "4. FOTO KABEL SAKELAR TUNGGAL", label: "Foto Kabel Sakelar Tunggal", type: "photo", section: SECTION.KST },

  // ---- 5. Kabel Sakelar Ganda ----
  { key: "ksgMerk", header: "5. MERK KABEL SAKELAR GANDA", label: "Merk Kabel Sakelar Ganda", type: "text", section: SECTION.KSG },
  { key: "ksgUkuran", header: "5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM", label: "Ukuran 3x1.5 mm", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KSG },
  { key: "ksgPanjang", header: "5. KABEL SAKELAR GANDA PANJANG 3 M", label: "Panjang 3 m", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KSG },
  { key: "ksgKet", header: "5. KET KABEL SAKELAR GANDA", label: "Keterangan", type: "longtext", section: SECTION.KSG },
  { key: "ksgFoto", header: "5. FOTO KABEL SAKELAR GANDA", label: "Foto Kabel Sakelar Ganda", type: "photo", section: SECTION.KSG },

  // ---- 6. Kabel Lampu ----
  { key: "klMerk", header: "6. MERK KABEL LAMPU", label: "Merk Kabel Lampu", type: "text", section: SECTION.KL },
  { key: "klUkuran", header: "6. KABEL LAMPU UKURAN 2X1.5 MM", label: "Ukuran 2x1.5 mm", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.KL },
  { key: "klPanjang", header: "6. KABEL LAMPU PANJANG 10 M", label: "Panjang 10 m", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.KL },
  { key: "klKet", header: "6. KET KABEL LAMPU", label: "Keterangan", type: "longtext", section: SECTION.KL },
  { key: "klFoto", header: "6. FOTO KABEL LAMPU", label: "Foto Kabel Lampu", type: "photo", section: SECTION.KL },

  // ---- 7. Roset, T-Dos, Klem ----
  { key: "rosetPasang", header: "7. PEMASANGAN ROSET, T-DOS,KLEM", label: "Pemasangan Roset, T-Dos, Klem", type: "enum", enumKind: "TERPASANG_TIDAK", section: SECTION.ROSET },
  { key: "rosetKet", header: "7. KET ROSET, T-DOS,KLEM", label: "Keterangan", type: "longtext", section: SECTION.ROSET },
  { key: "rosetFoto", header: "7. FOTO ROSET, T-DOS,KLEM", label: "Foto Roset, T-Dos, Klem", type: "photo", section: SECTION.ROSET },

  // ---- 8. Lampu ----
  { key: "lampuMerk", header: "8. MERK LAMPU", label: "Merk Lampu", type: "text", section: SECTION.LAMPU },
  { key: "lampuDaya", header: "8. DAYA LAMPU 10 WATT", label: "Daya Lampu 10 Watt", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.LAMPU },
  { key: "lampuKet", header: "8. KET LAMPU", label: "Keterangan", type: "longtext", section: SECTION.LAMPU },
  { key: "lampuFoto", header: "8. FOTO LAMPU", label: "Foto Lampu", type: "photo", section: SECTION.LAMPU },

  // ---- 9. Kotak Kontak ----
  { key: "kkMerk", header: "9. MERK KOTAK KONTAK", label: "Merk Kotak Kontak", type: "text", section: SECTION.KK },
  { key: "kkTipeC", header: "9. KOTAK KONTAK TIPE C", label: "Kotak Kontak Tipe C", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KK },
  { key: "kkKuningan", header: "9. KOTAK KONTAK KUNINGAN", label: "Kotak Kontak Kuningan", type: "enum", enumKind: "SESUAI_ONLY", section: SECTION.KK },
  { key: "kkKet", header: "9. KET KOTAK KONTAK", label: "Keterangan", type: "longtext", section: SECTION.KK },
  { key: "kkFoto", header: "9. FOTO KOTAK KONTAK", label: "Foto Kotak Kontak", type: "photo", section: SECTION.KK },

  // ---- 10. Sakelar Tunggal ----
  { key: "stMerk", header: "10. MERK SAKELAR TUNGGAL", label: "Merk Sakelar Tunggal", type: "text", section: SECTION.ST },
  { key: "stKet", header: "10. KET SAKELAR TUNGGAL", label: "Keterangan", type: "longtext", section: SECTION.ST },
  { key: "stFoto", header: "10. FOTO SAKELAR TUNGGAL", label: "Foto Sakelar Tunggal", type: "photo", section: SECTION.ST },

  // ---- 11. Sakelar Ganda ----
  { key: "sgMerk", header: "11. MERK SAKELAR GANDA", label: "Merk Sakelar Ganda", type: "text", section: SECTION.SG },
  { key: "sgKet", header: "11. KET SAKELAR GANDA", label: "Keterangan", type: "longtext", section: SECTION.SG },
  { key: "sgFoto", header: "11. FOTO SAKELAR GANDA", label: "Foto Sakelar Ganda", type: "photo", section: SECTION.SG },

  // ---- 12. Fitting Lampu ----
  { key: "flMerk", header: "12. MERK FITTING LAMPU", label: "Merk Fitting Lampu", type: "text", section: SECTION.FL },
  { key: "flKet", header: "12. KET FITTING LAMPU", label: "Keterangan", type: "longtext", section: SECTION.FL },
  { key: "flFoto", header: "12. FOTO FITTING LAMPU", label: "Foto Fitting Lampu", type: "photo", section: SECTION.FL },

  // ---- 13. Earthing Rod ----
  { key: "erPasang", header: "13. PEMASANGAN EARTHING ROD", label: "Pemasangan Earthing Rod", type: "enum", enumKind: "TERPASANG_TIDAK", section: SECTION.ER },
  { key: "erDiameter", header: "13. DIAMETER EARTHING ROD", label: "Diameter Earthing Rod", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.ER },
  { key: "erKet", header: "13. KET EARTHING ROD", label: "Keterangan", type: "longtext", section: SECTION.ER },
  { key: "erFoto", header: "13. FOTO EARTHING ROD", label: "Foto Earthing Rod", type: "photo", section: SECTION.ER },

  // ---- 14. Earthing Konduktor ----
  { key: "ekMerk", header: "14. MERK EARTHING KONDUKTOR", label: "Merk Earthing Konduktor", type: "text", section: SECTION.EK },
  { key: "ekTembaga", header: "14. EARTHING KONDUKTOR TEMBAGA", label: "Earthing Konduktor Tembaga", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.EK },
  { key: "ekPipa", header: "14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA", label: "Pipa Pelindung", type: "enum", enumKind: "SESUAI_TIDAK", section: SECTION.EK },
  { key: "ekKet", header: "14. KET EARTHING KONDUKTOR", label: "Keterangan", type: "longtext", section: SECTION.EK },
  { key: "ekFoto", header: "14. FOTO EARTHING KONDUKTOR", label: "Foto Earthing Konduktor", type: "photo", section: SECTION.EK },

  // ---- 15. Stiker ----
  { key: "stikerPasang", header: "15. PEMASANGAN STIKER", label: "Pemasangan Stiker", type: "enum", enumKind: "TERPASANG_TIDAK", section: SECTION.STIKER },
  { key: "stikerFoto", header: "15. FOTO STIKER", label: "Foto Stiker", type: "photo", section: SECTION.STIKER },

  // ---- 16. Dokumen SLO ----
  { key: "sloPenyerahan", header: "16. PENYERAHAN DOK SLO", label: "Penyerahan Dokumen SLO", type: "enum", enumKind: "DITERIMA", section: SECTION.SLO },
  { key: "sloFoto", header: "16. FOTO SLO", label: "Foto SLO", type: "photo", section: SECTION.SLO },

  // ---- 17. Tambahan ----
  { key: "ketTambahan", header: "17. KET TAMBAHAN", label: "Keterangan Tambahan", type: "longtext", section: SECTION.TAMBAHAN },
  { key: "fotoPelanggan", header: "17. FOTO BERSAMA PELANGGAN", label: "Foto Bersama Pelanggan", type: "photo", section: SECTION.TAMBAHAN },
  { key: "koordinat", header: "KOORDINAT", label: "Koordinat (latitude, longitude)", type: "coord", section: SECTION.TAMBAHAN, hint: "Contoh: -5.376248, 105.221963" },
  { key: "validasi", header: "Validasi", label: "Validasi (kolom sheet)", type: "enum", enumKind: "VALIDATION_STATUS", section: SECTION.TAMBAHAN, systemManaged: true },

  // ---- 18. Audit / Validasi (kolom tambahan setelah CC) ----
  { key: "inputBy", header: "INPUT_BY", label: "Diinput oleh", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "inputAt", header: "INPUT_AT", label: "Waktu input", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "updatedBy", header: "UPDATED_BY", label: "Diubah oleh", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "updatedAt", header: "UPDATED_AT", label: "Waktu update", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "validationStatus", header: "VALIDATION_STATUS", label: "Status Validasi", type: "enum", enumKind: "VALIDATION_STATUS", section: SECTION.AUDIT, systemManaged: true },
  { key: "validatedBy", header: "VALIDATED_BY", label: "Validator", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "validatedAt", header: "VALIDATED_AT", label: "Waktu validasi", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "validationNote", header: "VALIDATION_NOTE", label: "Catatan validasi", type: "longtext", section: SECTION.AUDIT, systemManaged: true },
  { key: "isDeleted", header: "IS_DELETED", label: "Dihapus", type: "enum", enumKind: "BOOL", section: SECTION.AUDIT, systemManaged: true },
  { key: "deletedBy", header: "DELETED_BY", label: "Dihapus oleh", type: "audit", section: SECTION.AUDIT, systemManaged: true },
  { key: "deletedAt", header: "DELETED_AT", label: "Waktu hapus", type: "audit", section: SECTION.AUDIT, systemManaged: true },
];

export const COLUMNS: ColumnDef[] = SPEC.map((spec, i) => ({
  ...spec,
  index: i + 1,
  col: indexToCol(i + 1),
}));

export const COLUMNS_BY_KEY: Record<string, ColumnDef> = Object.fromEntries(
  COLUMNS.map((c) => [c.key, c]),
);

export const HEADER_ROW: string[] = COLUMNS.map((c) => c.header);

export const LAST_COL_LETTER = indexToCol(COLUMNS.length);

/** Sections in display order (excluding the audit section, kept apart). */
export const FORM_SECTIONS = Array.from(
  new Set(COLUMNS.filter((c) => c.section !== SECTION.AUDIT).map((c) => c.section)),
);

export const AUDIT_SECTION = SECTION.AUDIT;

/** Photo columns with their suggested file slug used when uploading to Drive. */
export const PHOTO_COLUMNS = COLUMNS.filter((c) => c.type === "photo");

export type RowRecord = Record<string, string>;

/** Convert a sheet row (array of strings) into a typed record by key. */
export function rowToRecord(row: ReadonlyArray<unknown>): RowRecord {
  const rec: RowRecord = {};
  for (const c of COLUMNS) {
    const v = row[c.index - 1];
    rec[c.key] = v === undefined || v === null ? "" : String(v);
  }
  return rec;
}

/** Convert a typed record into a row aligned to the column order. */
export function recordToRow(rec: RowRecord): string[] {
  return COLUMNS.map((c) => rec[c.key] ?? "");
}
