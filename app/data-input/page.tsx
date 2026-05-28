import Link from "next/link";
import { ensureSheetReady, readAllRecords } from "@/lib/sheet";
import { StatusTag } from "@/components/StatusTag";
import { effectiveStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

type Search = Promise<{ q?: string; status?: string; deleted?: string }>;

const STATUS_FILTERS = [
  "DRAFT",
  "MENUNGGU_VALIDASI",
  "VALID",
  "PERLU_REVISI",
  "DITOLAK",
] as const;

export default async function DataInputListPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await ensureSheetReady();
  const all = await readAllRecords();

  const sp = await searchParams;
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = (sp.status ?? "").trim();
  const includeDeleted = sp.deleted === "1";

  const rows = all
    .filter((r) => (includeDeleted ? true : r.isDeleted !== "TRUE"))
    .filter((r) => (status ? effectiveStatus(r) === status : true))
    .filter((r) => {
      if (!q) return true;
      const hay = [
        r.no,
        r.nama,
        r.idpel,
        r.noMeter,
        r.mitra,
        r.unitTujuan,
        r.kabupatenKota,
        r.kecamatan,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .reverse();

  const stats = summarise(all);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          Data Pemeriksaan
        </p>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">
          Daftar Pemeriksaan BPBL
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Menampilkan {rows.length.toLocaleString("id-ID")} dari{" "}
          {all.length.toLocaleString("id-ID")} data pemeriksaan.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Data" value={stats.total} tone="primary" />
        <StatCard
          label="Menunggu Validasi"
          value={stats.waiting}
          tone="warning"
        />
        <StatCard label="Valid" value={stats.valid} tone="success" />
        <StatCard
          label="Perlu Revisi / Ditolak"
          value={stats.problem}
          tone="danger"
        />
      </section>

      <form
        className="card flex flex-wrap items-center gap-2 p-3"
        method="get"
        action="/data-input"
      >
        <div className="flex flex-1 min-w-[220px] items-center gap-2">
          <span aria-hidden className="text-[var(--muted)]">
            🔍
          </span>
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Cari NO, nama, IDPEL, mitra, unit…"
            className="input border-0 bg-transparent shadow-none focus:ring-0 focus:border-transparent focus:shadow-none"
            style={{ outline: "none" }}
          />
        </div>
        <select name="status" defaultValue={status} className="select w-52">
          <option value="">Semua status</option>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)] px-2">
          <input
            type="checkbox"
            name="deleted"
            value="1"
            defaultChecked={includeDeleted}
          />
          tampilkan terhapus
        </label>
        <button className="btn btn-outline" type="submit">
          Filter
        </button>
        {(q || status || includeDeleted) && (
          <Link className="btn btn-ghost" href="/data-input">
            Reset
          </Link>
        )}
      </form>

      <section className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--primary-strong)] text-left text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">NO</th>
                <th className="px-4 py-3 font-semibold whitespace-nowrap">
                  Tanggal
                </th>
                <th className="px-4 py-3 font-semibold">Pelanggan</th>
                <th className="px-4 py-3 font-semibold">Lokasi</th>
                <th className="px-4 py-3 font-semibold">Mitra</th>
                <th className="px-4 py-3 font-semibold">Unit</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-[var(--muted)]"
                  >
                    Belum ada data yang cocok dengan filter ini.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr
                  key={r.no}
                  className="border-t border-[var(--border)] transition-colors hover:bg-[var(--card-muted)]"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link
                      href={`/data-input/${encodeURIComponent(r.no)}`}
                      className="text-[var(--primary)] hover:underline"
                    >
                      {r.no}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-[var(--muted)]">
                    {fmtDate(r.tanggalSubmit)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.nama || "—"}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {r.idpel ? `IDPEL ${r.idpel}` : "Tanpa IDPEL"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    <div>{r.kabupatenKota || "—"}</div>
                    <div className="text-xs">
                      {[r.kecamatan, r.desaKelurahan]
                        .filter(Boolean)
                        .join(" · ") || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.mitra || "—"}</td>
                  <td className="px-4 py-3">
                    <div>{r.unitTujuan || "—"}</div>
                    <div className="text-xs text-[var(--muted)]">
                      {r.up3Tujuan || ""}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <StatusTag status={effectiveStatus(r)} />
                      {r.isDeleted === "TRUE" && (
                        <span className="tag tag-danger">DIHAPUS</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        className="btn btn-ghost btn-sm"
                        href={`/data-input/${encodeURIComponent(r.no)}`}
                      >
                        Detail
                      </Link>
                      <Link
                        className="btn btn-ghost btn-sm"
                        href={`/data-input/${encodeURIComponent(r.no)}/edit`}
                      >
                        Edit
                      </Link>
                      <Link
                        className="btn btn-outline btn-sm"
                        href={`/data-input/${encodeURIComponent(r.no)}/validasi`}
                      >
                        Validasi
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function fmtDate(value: string | undefined): string {
  if (!value) return "—";
  // Many entries are saved as "YYYY-MM-DD HH:MM:SS"; trim seconds to keep it tidy.
  const m = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/.exec(value.trim());
  if (m) return `${m[1]} ${m[2]}`;
  return value;
}

function summarise(all: { validationStatus?: string; validasi?: string; isDeleted?: string }[]) {
  const stats = { total: 0, waiting: 0, valid: 0, problem: 0 };
  for (const r of all) {
    if (r.isDeleted === "TRUE") continue;
    stats.total++;
    const s = effectiveStatus(r);
    if (s === "MENUNGGU_VALIDASI") stats.waiting++;
    else if (s === "VALID") stats.valid++;
    else if (s === "PERLU_REVISI" || s === "DITOLAK") stats.problem++;
  }
  return stats;
}

function StatCard(props: {
  label: string;
  value: number;
  tone: "primary" | "warning" | "success" | "danger";
}) {
  const colorVar =
    props.tone === "primary"
      ? "var(--primary)"
      : props.tone === "warning"
        ? "var(--warning)"
        : props.tone === "success"
          ? "var(--success)"
          : "var(--danger)";
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {props.label}
      </p>
      <p
        className="mt-1 text-2xl font-semibold tabular-nums"
        style={{ color: colorVar }}
      >
        {props.value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}
