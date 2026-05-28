import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section
        className="card overflow-hidden p-0"
        style={{
          backgroundImage:
            "linear-gradient(135deg, var(--primary-strong) 0%, var(--primary) 60%, color-mix(in srgb, var(--primary) 70%, var(--accent) 30%) 100%)",
          color: "#ffffff",
          borderColor: "transparent",
        }}
      >
        <div className="grid items-center gap-6 p-6 md:grid-cols-[1.5fr_1fr] md:p-8">
          <div className="flex flex-col gap-3">
            <span className="tag tag-primary w-fit" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", borderColor: "rgba(255,255,255,0.3)" }}>
              PLN · Pemeriksaan BPBL
            </span>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              Catat pemeriksaan BPBL dengan rapi.
            </h1>
            <p className="max-w-prose text-sm opacity-90 md:text-base">
              Form pemeriksaan terbagi 17 tahap singkat sehingga petugas tidak
              kewalahan. Data tersimpan otomatis ke Google Spreadsheet, foto
              langsung ke Google Drive.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link className="btn btn-accent" href="/data-input/create">
                Mulai Pemeriksaan Baru
              </Link>
              <Link
                className="btn btn-ghost"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
                href="/dashboard"
              >
                Lihat Dashboard
              </Link>
              <Link
                className="btn btn-ghost"
                style={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff" }}
                href="/data-input"
              >
                Daftar Data
              </Link>
            </div>
          </div>
          <div
            className="hidden md:flex h-48 items-center justify-center rounded-xl"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px dashed rgba(255,255,255,0.25)",
            }}
          >
            <span className="pln-mark scale-[2.2]" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <FeatureCard
          title="Form bertahap"
          desc="17 langkah pemeriksaan dipandu satu-per-satu, lengkap dengan progress dan ringkasan akhir."
        />
        <FeatureCard
          title="Foto ke Drive"
          desc="Upload gambar langsung dari kamera atau berkas. Spreadsheet menyimpan link/fileId."
        />
        <FeatureCard
          title="Validasi & audit"
          desc="Status DRAFT, MENUNGGU_VALIDASI, VALID, PERLU_REVISI, DITOLAK plus jejak siapa yang input."
        />
      </section>

      <section className="card p-5">
        <h2 className="text-base font-semibold">Pengaturan awal</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          <li>
            Salin <code>.env.example</code> menjadi <code>.env.local</code>,
            lalu isi kredensial service account, ID Spreadsheet, dan ID folder
            Drive.
          </li>
          <li>
            Bagikan Spreadsheet dan folder Drive ke email service account
            dengan akses <em>Editor</em>.
          </li>
          <li>
            Buka{" "}
            <Link href="/data-input" className="text-[var(--primary)] underline">
              Daftar Data
            </Link>{" "}
            sekali. Bila tab <code>DATA INPUT</code> belum ada, aplikasi akan
            membuatnya beserta header lengkap.
          </li>
        </ol>
      </section>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="card p-5">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--primary-soft)] text-[var(--primary)]">
        ★
      </div>
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
    </div>
  );
}
