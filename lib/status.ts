/**
 * Tiny helpers for the validation status field. The spreadsheet may use either
 * the canonical `VALIDATION_STATUS` audit column, the `Validasi` column at the
 * end of the data, or both. We prefer whichever is filled first.
 */
export function effectiveStatus(record: {
  validationStatus?: string;
  validasi?: string;
}): string {
  const a = (record.validationStatus ?? "").trim();
  const b = (record.validasi ?? "").trim();
  return (a || b || "DRAFT").toUpperCase();
}
