import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pemeriksaan BPBL · PLN",
  description:
    "Aplikasi CRUD pemeriksaan BPBL berbasis Google Spreadsheet & Drive",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="brand-bar">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="pln-mark">PLN</span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Pemeriksaan BPBL</span>
                <span className="text-xs opacity-80">
                  Bantuan Pasang Baru Listrik
                </span>
              </span>
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <Link className="btn btn-ghost btn-sm" href="/dashboard">
                Dashboard
              </Link>
              <Link className="btn btn-ghost btn-sm" href="/data-input">
                Daftar Data
              </Link>
              <Link className="btn btn-accent btn-sm" href="/data-input/create">
                + Tambah Pemeriksaan
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[var(--border)] bg-[var(--card)] py-3 text-center text-xs text-[var(--muted)]">
          Data tersimpan di Google Sheets · Foto tersimpan di Google Drive
        </footer>
      </body>
    </html>
  );
}
