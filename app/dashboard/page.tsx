import { ensureSheetReady } from "@/lib/sheet";
import { buildRekap, type RekapRow } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await ensureSheetReady();
  const rekap = await buildRekap();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          Dashboard
        </p>
        <h1 className="text-2xl font-semibold">Rekap Pemeriksaan BPBL</h1>
        <p className="text-sm text-[var(--muted)]">
          Ringkasan progres pemeriksaan per ULP, UP3, dan Mitra (Bangsang).
        </p>
      </header>

      <SummaryStrip totals={rekap.totals} />

      <SourceLine
        label="Sumber rekap ULP"
        tab={rekap.diagnostics.ulp.resolvedTab}
      />

      {!rekap.diagnostics.ulp.resolvedTab && (
        <TargetNotice
          title="Tab target ULP belum terdeteksi"
          description={
            <>
              {rekap.diagnostics.ulp.reason ?? "Tab target tidak ditemukan."}{" "}
              Tab yang tersedia di spreadsheet:{" "}
              {rekap.diagnostics.availableTabs.length === 0 ? (
                <em>tidak terbaca</em>
              ) : (
                <code>{rekap.diagnostics.availableTabs.join(", ")}</code>
              )}
              .
            </>
          }
        />
      )}

      <RekapTable
        title="Rekap per ULP"
        keyHeader="ULP"
        groupHeader="UP3"
        rows={rekap.perUlp}
        showGroup
      />

      <RekapTable title="Rekap per UP3" keyHeader="UP3" rows={rekap.perUp3} />

      <SourceLine
        label="Sumber rekap Mitra"
        tab={rekap.diagnostics.mitra.resolvedTab}
      />
      {!rekap.diagnostics.mitra.resolvedTab && (
        <TargetNotice
          title="Tab target Mitra belum terdeteksi"
          description={
            <>
              {rekap.diagnostics.mitra.reason ?? "Tab target tidak ditemukan."}{" "}
              Pastikan ada tab dengan kolom <code>MITRA</code> (atau{" "}
              <code>BANGSANG</code>) dan <code>JUMLAH PELANGGAN</code>.
            </>
          }
        />
      )}

      <RekapTable
        title="Rekap per Bangsang (Mitra)"
        keyHeader="Bangsang"
        rows={rekap.perMitra}
      />
    </div>
  );
}

function fmtInt(value: number | null): string {
  if (value === null) return "—";
  return value.toLocaleString("id-ID");
}

function fmtPct(value: number | null): string {
  if (value === null) return "—";
  return (value * 100).toFixed(2) + "%";
}

function SummaryStrip({
  totals,
}: {
  totals: {
    jumlahPelanggan: number | null;
    sudahPerbaikanSlo: number | null;
    sudahDiperiksa: number | null;
    belumDiperiksa: number | null;
    persentase: number | null;
  };
}) {
  return (
    <section className="card overflow-hidden p-0">
      <div className="grid grid-cols-2 gap-px bg-[var(--border)] sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCell
          label="Jumlah Pelanggan"
          value={fmtInt(totals.jumlahPelanggan)}
          tone="primary"
        />
        <SummaryCell
          label="Sudah Perbaikan SLO"
          value={fmtInt(totals.sudahPerbaikanSlo)}
          tone="success"
        />
        <SummaryCell
          label="Sudah Diperiksa On-Site"
          value={fmtInt(totals.sudahDiperiksa)}
          tone="primary"
        />
        <SummaryCell
          label="Belum Diperiksa On-Site"
          value={fmtInt(totals.belumDiperiksa)}
          tone="warning"
        />
        <SummaryCell
          label="Persentase Pemeriksaan"
          value={fmtPct(totals.persentase)}
          tone="primary"
          highlight
        />
      </div>
    </section>
  );
}

function SummaryCell(props: {
  label: string;
  value: string;
  tone: "primary" | "warning" | "success" | "danger";
  highlight?: boolean;
}) {
  const color =
    props.tone === "primary"
      ? "var(--primary)"
      : props.tone === "warning"
        ? "var(--warning)"
        : props.tone === "success"
          ? "var(--success)"
          : "var(--danger)";
  return (
    <div
      className={`flex flex-col gap-1 bg-[var(--card)] p-4 ${
        props.highlight ? "ring-inset ring-2 ring-[var(--accent)]" : ""
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--muted)]">
        {props.label}
      </p>
      <p
        className="text-2xl font-semibold tabular-nums"
        style={{ color }}
      >
        {props.value}
      </p>
    </div>
  );
}

function SourceLine({ label, tab }: { label: string; tab: string | undefined }) {
  if (!tab) return null;
  return (
    <p className="text-xs text-[var(--muted)]">
      {label}: <code className="text-[var(--foreground)]">{tab}</code>
    </p>
  );
}

function TargetNotice(props: {
  title: string;
  description: React.ReactNode;
}) {
  return (
    <div
      className="card flex flex-col gap-1 p-4"
      style={{ borderColor: "var(--warning)" }}
    >
      <p
        className="text-sm font-semibold"
        style={{ color: "var(--warning)" }}
      >
        ⚠ {props.title}
      </p>
      <p className="text-sm text-[var(--muted)]">{props.description}</p>
    </div>
  );
}

function RekapTable(props: {
  title: string;
  keyHeader: string;
  groupHeader?: string;
  rows: RekapRow[];
  showGroup?: boolean;
}) {
  const totals = props.rows.reduce(
    (acc, r) => {
      if (r.jumlahPelanggan !== null) {
        acc.jumlahPelanggan = (acc.jumlahPelanggan ?? 0) + r.jumlahPelanggan;
      }
      if (r.sudahPerbaikanSlo !== null) {
        acc.sudahPerbaikanSlo =
          (acc.sudahPerbaikanSlo ?? 0) + r.sudahPerbaikanSlo;
      }
      if (r.sudahDiperiksa !== null) {
        acc.sudahDiperiksa = (acc.sudahDiperiksa ?? 0) + r.sudahDiperiksa;
      }
      if (r.belumDiperiksa !== null) {
        acc.belumDiperiksa = (acc.belumDiperiksa ?? 0) + r.belumDiperiksa;
      }
      return acc;
    },
    {
      jumlahPelanggan: null as number | null,
      sudahPerbaikanSlo: null as number | null,
      sudahDiperiksa: null as number | null,
      belumDiperiksa: null as number | null,
    },
  );
  const totalPct =
    totals.jumlahPelanggan !== null &&
    totals.jumlahPelanggan > 0 &&
    totals.sudahDiperiksa !== null
      ? totals.sudahDiperiksa / totals.jumlahPelanggan
      : null;

  return (
    <section className="card overflow-hidden">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--primary)]">
          {props.title}
        </h2>
        <span className="text-xs text-[var(--muted)]">
          {props.rows.length} baris
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--primary-strong)] text-left text-white">
            <tr>
              <th className="w-12 px-3 py-2.5 text-center font-semibold">
                NO
              </th>
              <th className="px-3 py-2.5 font-semibold">{props.keyHeader}</th>
              {props.showGroup && (
                <th className="px-3 py-2.5 font-semibold">
                  {props.groupHeader}
                </th>
              )}
              <th className="px-3 py-2.5 text-right font-semibold">
                Jumlah Pelanggan
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Sudah Perbaikan SLO
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Sudah Diperiksa On-Site
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Belum Diperiksa On-Site
              </th>
              <th className="px-3 py-2.5 text-right font-semibold">
                Persentase Pemeriksaan
              </th>
            </tr>
          </thead>
          <tbody>
            {props.rows.length === 0 && (
              <tr>
                <td
                  colSpan={props.showGroup ? 8 : 7}
                  className="px-3 py-10 text-center text-[var(--muted)]"
                >
                  Belum ada data.
                </td>
              </tr>
            )}
            {props.rows.map((r, i) => (
              <tr
                key={r.key}
                className="border-t border-[var(--border)] hover:bg-[var(--card-muted)]"
              >
                <td className="px-3 py-2 text-center text-[var(--muted)]">
                  {i + 1}
                </td>
                <td className="px-3 py-2 font-medium">{r.key}</td>
                {props.showGroup && (
                  <td className="px-3 py-2 text-[var(--muted)]">
                    {r.group ?? "—"}
                  </td>
                )}
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtInt(r.jumlahPelanggan)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtInt(r.sudahPerbaikanSlo)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtInt(r.sudahDiperiksa)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">
                  {fmtInt(r.belumDiperiksa)}
                </td>
                <td className="px-3 py-2 text-right">
                  <PercentBar value={r.persentase} />
                </td>
              </tr>
            ))}
          </tbody>
          {props.rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-[var(--border-strong)] bg-[var(--card-muted)] font-semibold">
                <td className="px-3 py-2.5 text-center">{props.rows.length}</td>
                <td className="px-3 py-2.5" colSpan={props.showGroup ? 2 : 1}>
                  TOTAL
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                  {fmtInt(totals.jumlahPelanggan)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                  {fmtInt(totals.sudahPerbaikanSlo)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                  {fmtInt(totals.sudahDiperiksa)}
                </td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">
                  {fmtInt(totals.belumDiperiksa)}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <PercentBar value={totalPct} strong />
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}

function PercentBar({
  value,
  strong,
}: {
  value: number | null;
  strong?: boolean;
}) {
  if (value === null) {
    return <span className="font-mono text-xs text-[var(--muted)]">—</span>;
  }
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 10000) / 100;
  return (
    <div className="flex items-center justify-end gap-2">
      <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[var(--border)] sm:block">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: strong ? "var(--primary-strong)" : "var(--primary)",
          }}
        />
      </div>
      <span
        className="font-mono text-xs tabular-nums"
        style={{
          color: strong ? "var(--primary-strong)" : "var(--foreground)",
        }}
      >
        {pct.toFixed(2)}%
      </span>
    </div>
  );
}
