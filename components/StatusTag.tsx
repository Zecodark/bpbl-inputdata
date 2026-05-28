type Props = { status: string | undefined };

const TONE: Record<string, string> = {
  DRAFT: "tag-muted",
  MENUNGGU_VALIDASI: "tag-warning",
  VALID: "tag-success",
  PERLU_REVISI: "tag-warning",
  DITOLAK: "tag-danger",
};

/** Coloured pill summarising a record's validation state. */
export function StatusTag({ status }: Props) {
  const s = (status ?? "").trim() || "DRAFT";
  return <span className={`tag ${TONE[s] ?? ""}`}>{s.replace(/_/g, " ")}</span>;
}
