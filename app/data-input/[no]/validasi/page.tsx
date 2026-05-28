import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSheetReady, findRowByNo } from "@/lib/sheet";
import { effectiveStatus } from "@/lib/status";
import { ValidationForm } from "./validation-form";

export const dynamic = "force-dynamic";

export default async function ValidasiPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  await ensureSheetReady();
  const { no } = await params;
  const decoded = decodeURIComponent(no);
  const found = await findRowByNo(decoded);
  if (!found) notFound();
  return (
    <div className="flex flex-col gap-4">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/data-input" className="hover:underline">
          Daftar Pemeriksaan
        </Link>{" "}
        <span className="mx-1">/</span>{" "}
        <Link
          href={`/data-input/${encodeURIComponent(found.record.no)}`}
          className="hover:underline"
        >
          {found.record.no}
        </Link>{" "}
        <span className="mx-1">/</span> Validasi
      </nav>
      <header>
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
          Validasi Pemeriksaan
        </p>
        <h1 className="font-mono text-xl font-semibold text-[var(--primary)]">
          {found.record.no}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Tinjau dan tetapkan status validasi data ini.
        </p>
      </header>
      <ValidationForm
        no={found.record.no}
        currentStatus={effectiveStatus(found.record)}
        currentNote={found.record.validationNote || ""}
      />
    </div>
  );
}
