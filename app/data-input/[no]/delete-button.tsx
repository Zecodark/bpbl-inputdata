"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

/** Soft-delete trigger used on the detail page. */
export function DeleteButton({
  no,
  disabled,
}: {
  no: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();

  async function onDelete() {
    if (
      !confirm(
        "Hapus data ini? Data akan ditandai sebagai dihapus, tidak dihapus permanen.",
      )
    )
      return;
    setBusy(true);
    try {
      const resp = await fetch(`/api/data-input/${encodeURIComponent(no)}`, {
        method: "DELETE",
      });
      if (!resp.ok) {
        alert("Gagal menghapus");
      } else {
        startTransition(() => {
          router.refresh();
          router.push("/data-input");
        });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      className="btn btn-danger"
      onClick={onDelete}
      disabled={disabled || busy || pending}
    >
      {busy || pending ? "Menghapus…" : "Hapus"}
    </button>
  );
}
