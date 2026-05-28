import Link from "next/link";
import { notFound } from "next/navigation";
import { ensureSheetReady, findRowByNo } from "@/lib/sheet";
import { COLUMNS, FORM_SECTIONS, AUDIT_SECTION } from "@/lib/columns";
import { photoPreviewUrl } from "@/lib/drive";
import { StatusTag } from "@/components/StatusTag";
import { effectiveStatus } from "@/lib/status";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function DetailPage({
  params,
}: {
  params: Promise<{ no: string }>;
}) {
  await ensureSheetReady();
  const { no } = await params;
  const found = await findRowByNo(decodeURIComponent(no));
  if (!found) notFound();
  const r = found.record;

  return (
    <div className="flex flex-col gap-4">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/data-input" className="hover:underline">
          Daftar Pemeriksaan
        </Link>{" "}
        <span className="mx-1">/</span>{" "}
        <span className="font-mono">{r.no}</span>
      </nav>

      <header className="card flex flex-wrap items-start justify-between gap-3 p-5">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Detail Pemeriksaan
          </p>
          <h1 className="font-mono text-xl font-semibold text-[var(--primary)]">
            {r.no}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <StatusTag status={effectiveStatus(r)} />
            {r.isDeleted === "TRUE" && (
              <span className="tag tag-danger">DIHAPUS</span>
            )}
            <span className="text-[var(--muted)]">
              · disubmit {r.tanggalSubmit || "—"}
            </span>
          </div>
          {r.nama && (
            <p className="text-sm text-[var(--foreground)]">
              <strong>{r.nama}</strong>
              {r.idpel ? ` · IDPEL ${r.idpel}` : ""}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/data-input/${encodeURIComponent(r.no)}/edit`}
            className="btn btn-ghost"
          >
            Edit
          </Link>
          <Link
            href={`/data-input/${encodeURIComponent(r.no)}/validasi`}
            className="btn btn-outline"
          >
            Validasi
          </Link>
          <DeleteButton no={r.no} disabled={r.isDeleted === "TRUE"} />
        </div>
      </header>

      {[...FORM_SECTIONS, AUDIT_SECTION].map((section) => {
        const cols = COLUMNS.filter((c) => c.section === section);
        if (cols.length === 0) return null;
        return (
          <section key={section} className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--primary)]">
              {section}
            </h2>
            <dl className="mt-3 grid gap-x-4 gap-y-3 md:grid-cols-2">
              {cols.map((c) => (
                <div
                  key={c.key}
                  className={
                    c.type === "longtext" || c.type === "photo"
                      ? "md:col-span-2"
                      : ""
                  }
                >
                  <dt className="text-xs text-[var(--muted)]">{c.label}</dt>
                  <dd className="mt-0.5 text-sm">
                    {c.type === "photo" ? (
                      <PhotoCell value={r[c.key]} />
                    ) : (
                      <span
                        className={
                          c.type === "longtext"
                            ? "whitespace-pre-wrap"
                            : ""
                        }
                      >
                        {r[c.key] || (
                          <em className="text-[var(--muted)]">—</em>
                        )}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

function PhotoCell({ value }: { value: string | undefined }) {
  const url = photoPreviewUrl(value);
  if (!url) return <em className="text-[var(--muted)]">—</em>;
  const isFileId = value && /^[a-zA-Z0-9_-]{10,}$/.test(value.trim());
  const link = isFileId
    ? `https://drive.google.com/file/d/${value!.trim()}/view`
    : value!;
  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      className="inline-block"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Foto pemeriksaan"
        className="h-32 w-32 rounded-lg border border-[var(--border)] object-cover"
        loading="lazy"
      />
    </a>
  );
}
