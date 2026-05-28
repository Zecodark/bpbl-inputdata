"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ENUM_OPTIONS } from "@/lib/columns";
import { nowStamp } from "@/lib/id";

export function ValidationForm({
  no,
  currentStatus,
  currentNote,
}: {
  no: string;
  currentStatus: string;
  currentNote: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(currentNote);
  const [validator, setValidator] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const resp = await fetch(`/api/data-input/${encodeURIComponent(no)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actor: validator || "validator",
          patch: {
            validationStatus: status,
            validasi: status,
            validationNote: note,
            validatedBy: validator || "validator",
            validatedAt: nowStamp(),
          },
        }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Request gagal (${resp.status})`);
      }
      startTransition(() =>
        router.push(`/data-input/${encodeURIComponent(no)}`),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card flex flex-col gap-4 p-4">
      <div>
        <label className="mb-1 block text-sm font-medium">
          Nama / email validator
        </label>
        <input
          className="input"
          value={validator}
          onChange={(e) => setValidator(e.target.value)}
          placeholder="contoh: petugas@pln.co.id"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Status validasi</label>
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {ENUM_OPTIONS.VALIDATION_STATUS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Catatan validasi</label>
        <textarea
          className="textarea"
          rows={4}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Catatan revisi atau alasan penolakan…"
        />
      </div>
      {error && (
        <div className="text-sm text-[var(--danger)]">{error}</div>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => router.back()}
        >
          Batal
        </button>
        <button className="btn btn-primary" disabled={saving || pending}>
          {saving || pending ? "Menyimpan…" : "Simpan Validasi"}
        </button>
      </div>
    </form>
  );
}
