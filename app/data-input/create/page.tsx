import Link from "next/link";
import { PemeriksaanForm } from "@/components/PemeriksaanForm";

export const dynamic = "force-dynamic";

export default function CreateDataInputPage() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/data-input" className="hover:underline">
          Daftar Pemeriksaan
        </Link>{" "}
        <span className="mx-1">/</span> Tambah baru
      </nav>
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Tambah Pemeriksaan</h1>
        <p className="text-sm text-[var(--muted)]">
          Isi formulir pemeriksaan secara bertahap. ID dan tanggal submit
          dibuat otomatis saat data disimpan.
        </p>
      </header>
      <PemeriksaanForm mode="create" />
    </div>
  );
}
