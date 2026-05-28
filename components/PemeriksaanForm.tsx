"use client";

import { useId, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  COLUMNS,
  ENUM_OPTIONS,
  FORM_SECTIONS,
  type ColumnDef,
  type RowRecord,
} from "@/lib/columns";
import { generateRecordNo } from "@/lib/id";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  /** Pre-filled record values when editing, partial when creating. */
  initial?: RowRecord;
  /** Used to scope photo uploads to a Drive sub-folder. */
  recordNo?: string;
};

type SaveState = "idle" | "saving" | "error";

const REVIEW_STEP_ID = "__review__";

/**
 * Multi-step wizard form. The 17 pemeriksaan sections (plus identity at the
 * top) are presented one at a time so field staff can move forward step by
 * step, with progress always visible. The final step is a review summary.
 */
export function PemeriksaanForm({ mode, initial, recordNo }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<RowRecord>(() => initial ?? {});
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [pending, startTransition] = useTransition();

  // Generate a NO once on mount so photo uploads can use the eventual record
  // folder name. The server checks uniqueness before reusing it.
  const reactId = useId();
  const [draftNo] = useState<string>(() =>
    recordNo ? recordNo : generateRecordNo(),
  );
  const uploadNo = useMemo(
    () => recordNo ?? draftNo ?? "TMP-" + reactId.replace(/[^a-zA-Z0-9_-]/g, ""),
    [recordNo, draftNo, reactId],
  );

  // Build the wizard step list from the section list, then add a review step.
  const steps = useMemo(() => {
    const visibleSections = FORM_SECTIONS.filter((section) =>
      COLUMNS.some((c) => c.section === section && !c.systemManaged),
    );
    const sectionSteps = visibleSections.map((section) => ({
      id: section,
      title: section,
      columns: COLUMNS.filter((c) => c.section === section && !c.systemManaged),
    }));
    return [
      ...sectionSteps,
      {
        id: REVIEW_STEP_ID,
        title: "Tinjau & Simpan",
        columns: [],
      },
    ];
  }, []);

  const totalSteps = steps.length;
  const current = steps[stepIndex];
  const isReview = current.id === REVIEW_STEP_ID;
  const isFirst = stepIndex === 0;

  function update(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function go(delta: number) {
    setStepIndex((idx) => {
      const next = Math.min(Math.max(idx + delta, 0), totalSteps - 1);
      return next;
    });
    // Bring the form to top so the next section is immediately visible.
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function jumpTo(target: number) {
    if (target < 0 || target >= totalSteps) return;
    setStepIndex(target);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleSave() {
    setError(null);
    setSaveState("saving");
    try {
      if (mode === "create") {
        const resp = await fetch("/api/data-input", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, no: draftNo }),
        });
        if (!resp.ok) throw new Error(await readError(resp));
        const json = (await resp.json()) as { data: RowRecord };
        startTransition(() =>
          router.push(`/data-input/${encodeURIComponent(json.data.no)}`),
        );
      } else {
        if (!recordNo) throw new Error("recordNo wajib dipasok untuk mode edit");
        const resp = await fetch(
          `/api/data-input/${encodeURIComponent(recordNo)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patch: values }),
          },
        );
        if (!resp.ok) throw new Error(await readError(resp));
        startTransition(() =>
          router.push(`/data-input/${encodeURIComponent(recordNo)}`),
        );
      }
    } catch (err) {
      setSaveState("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <StepSidebar
        steps={steps}
        activeIndex={stepIndex}
        onJump={jumpTo}
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isReview) {
            handleSave();
          } else {
            go(1);
          }
        }}
        className="flex flex-col gap-4"
      >
        <header className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            Langkah {stepIndex + 1} dari {totalSteps}
          </p>
          <h2 className="mt-0.5 text-lg font-semibold">{current.title}</h2>
          <ProgressBar value={(stepIndex + 1) / totalSteps} />
        </header>

        {!isReview ? (
          <section className="card p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {current.columns.map((c) => (
                <Field
                  key={c.key}
                  column={c}
                  value={values[c.key] ?? ""}
                  uploadNo={uploadNo}
                  onChange={(v) => update(c.key, v)}
                />
              ))}
            </div>
          </section>
        ) : (
          <ReviewPanel values={values} onJumpToStep={(sectionId) => {
            const idx = steps.findIndex((s) => s.id === sectionId);
            if (idx >= 0) jumpTo(idx);
          }} />
        )}

        {error && (
          <div className="card p-3 text-sm" style={{ borderColor: "var(--danger)", color: "var(--danger)" }}>
            {error}
          </div>
        )}

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-[0_-4px_12px_rgba(15,31,58,0.06)]">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => go(-1)}
            disabled={isFirst}
          >
            ← Sebelumnya
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => router.back()}
            >
              Batal
            </button>
            {!isReview ? (
              <button type="submit" className="btn btn-primary">
                Lanjut →
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saveState === "saving" || pending}
              >
                {saveState === "saving" || pending
                  ? "Menyimpan…"
                  : mode === "create"
                    ? "Simpan Pemeriksaan"
                    : "Simpan Perubahan"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

async function readError(resp: Response): Promise<string> {
  try {
    const j = (await resp.json()) as { error?: string };
    return j.error ?? `Request gagal (${resp.status})`;
  } catch {
    return `Request gagal (${resp.status})`;
  }
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
      <div
        className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StepSidebar(props: {
  steps: { id: string; title: string }[];
  activeIndex: number;
  onJump: (idx: number) => void;
}) {
  return (
    <aside className="card lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
      <div className="border-b border-[var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
        Tahapan
      </div>
      <ol className="flex flex-col py-2">
        {props.steps.map((step, i) => {
          const state =
            i < props.activeIndex
              ? "is-done"
              : i === props.activeIndex
                ? "is-active"
                : "";
          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => props.onJump(i)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--card-muted)] ${
                  i === props.activeIndex
                    ? "font-semibold text-[var(--primary)]"
                    : "text-[var(--foreground)]"
                }`}
              >
                <span className={`step-dot ${state}`}>
                  {i < props.activeIndex ? "✓" : i + 1}
                </span>
                <span className="flex-1 leading-snug">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

function ReviewPanel(props: {
  values: RowRecord;
  onJumpToStep: (sectionId: string) => void;
}) {
  const sections = FORM_SECTIONS.filter((section) =>
    COLUMNS.some((c) => c.section === section && !c.systemManaged),
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="card p-4">
        <h3 className="text-sm font-semibold">Cek ulang sebelum disimpan</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Klik tombol Edit pada bagian manapun untuk memperbaiki, atau tekan
          Simpan Pemeriksaan untuk menyelesaikan.
        </p>
      </div>
      {sections.map((section) => {
        const cols = COLUMNS.filter(
          (c) => c.section === section && !c.systemManaged,
        );
        return (
          <section key={section} className="card p-4">
            <header className="mb-2 flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold">{section}</h4>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => props.onJumpToStep(section)}
              >
                Edit
              </button>
            </header>
            <dl className="grid gap-x-4 gap-y-2 md:grid-cols-2">
              {cols.map((c) => {
                const v = props.values[c.key] ?? "";
                const display =
                  c.type === "photo" && v
                    ? "✓ Foto terupload"
                    : v || "—";
                return (
                  <div key={c.key} className="kv-row">
                    <dt className="text-xs text-[var(--muted)]">{c.label}</dt>
                    <dd
                      className={`text-sm ${
                        v ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                      } ${c.type === "longtext" ? "whitespace-pre-wrap" : ""}`}
                    >
                      {display}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}

function Field(props: {
  column: ColumnDef;
  value: string;
  uploadNo: string;
  onChange: (value: string) => void;
}) {
  const { column, value, onChange, uploadNo } = props;
  const id = `f-${column.key}`;

  if (column.type === "photo") {
    return (
      <PhotoField
        id={id}
        column={column}
        value={value}
        uploadNo={uploadNo}
        onChange={onChange}
      />
    );
  }

  const wrap = (input: React.ReactNode) => (
    <div className={column.type === "longtext" ? "md:col-span-2" : ""}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {column.label}
      </label>
      {input}
      {column.hint && (
        <p className="mt-1 text-xs text-[var(--muted)]">{column.hint}</p>
      )}
    </div>
  );

  if (column.type === "enum" && column.enumKind) {
    const opts = ENUM_OPTIONS[column.enumKind];
    return wrap(
      <select
        id={id}
        className="select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— pilih —</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>,
    );
  }

  if (column.type === "longtext") {
    return wrap(
      <textarea
        id={id}
        className="textarea"
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />,
    );
  }

  return wrap(
    <input
      id={id}
      className="input"
      type="text"
      inputMode={column.type === "number-text" ? "numeric" : undefined}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />,
  );
}

function PhotoField(props: {
  id: string;
  column: ColumnDef;
  value: string;
  uploadNo: string;
  onChange: (value: string) => void;
}) {
  const { id, column, value, uploadNo, onChange } = props;
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("no", uploadNo);
      fd.set("slug", column.key);
      const resp = await fetch("/api/upload", { method: "POST", body: fd });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Upload gagal (${resp.status})`);
      }
      const j = (await resp.json()) as {
        data: { fileId: string; webViewLink: string; thumbnail: string };
      };
      onChange(j.data.fileId);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  const preview = value
    ? value.startsWith("http")
      ? value
      : `https://drive.google.com/thumbnail?id=${value}&sz=w400`
    : null;

  return (
    <div className="md:col-span-2">
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {column.label}
      </label>
      <div className="flex flex-wrap items-start gap-3 rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card-muted)] p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={column.label}
            className="h-28 w-28 rounded-lg border border-[var(--border)] object-cover"
          />
        ) : (
          <div className="grid h-28 w-28 place-items-center rounded-lg border border-dashed border-[var(--border-strong)] bg-[var(--card)] text-center text-xs text-[var(--muted)]">
            Belum ada
            <br />
            foto
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2 min-w-[220px]">
          <input
            id={id}
            type="file"
            accept="image/*"
            capture="environment"
            disabled={uploading}
            onChange={onPick}
            className="text-sm"
          />
          <input
            type="text"
            placeholder="…atau tempel fileId / URL Drive"
            className="input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {uploading && (
            <span className="text-xs text-[var(--primary)]">
              Mengunggah ke Drive…
            </span>
          )}
          {err && <span className="text-xs text-[var(--danger)]">{err}</span>}
        </div>
      </div>
    </div>
  );
}
