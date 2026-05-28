# Pemeriksaan BPBL

Aplikasi CRUD pemeriksaan BPBL berbasis **Next.js 16 (App Router)** dengan
**Google Spreadsheet** sebagai basis data dan **Google Drive** sebagai
penyimpanan foto pemeriksaan.

Mengikuti rancangan di [`rancangan_aplikasi_crud_bpbl_spreadsheet_drive.md`](./rancangan_aplikasi_crud_bpbl_spreadsheet_drive.md).

## Fitur

- Daftar data pemeriksaan dari tab `DATA INPUT` (pencarian + filter status).
- Tambah pemeriksaan baru, NO dan timestamp dibuat otomatis.
- Edit data, soft delete, dan halaman validasi terpisah.
- Upload foto langsung dari form ke Google Drive; spreadsheet menyimpan `fileId`.
- Schema kolom (81 kolom utama + 11 kolom audit) didefinisikan satu kali di
  [`lib/columns.ts`](./lib/columns.ts) dan dipakai oleh form, API, dan tampilan.
- Inisialisasi otomatis: bila tab `DATA INPUT` belum ada di spreadsheet, aplikasi
  akan membuat tab dan menulis baris header sesuai schema.

## Persiapan

1. **Buat service account** di Google Cloud Console, aktifkan **Google Sheets API**
   dan **Google Drive API**, lalu unduh kunci JSON-nya.
2. **Bagikan akses** spreadsheet target dan folder Drive ke email service
   account dengan peran **Editor**.
3. Salin file environment:

   ```bash
   copy .env.example .env.local
   ```

   Lalu isi nilainya:

   ```env
   GOOGLE_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_SHEET_ID=spreadsheet_id_dari_url
   GOOGLE_DRIVE_FOLDER_ID=folder_id_drive_root
   GOOGLE_SHEET_TAB=DATA INPUT
   ```

   `GOOGLE_PRIVATE_KEY` boleh memakai literal `\n` (akan dikonversi otomatis).

4. Pasang dependencies dan jalankan dev server:

   ```bash
   npm install
   npm run dev
   ```

5. Buka <http://localhost:3000>. Saat halaman daftar dibuka pertama kali, tab
   `DATA INPUT` akan dibuat di spreadsheet bila belum ada.

## Struktur penting

```
app/
  page.tsx                             dashboard
  data-input/
    page.tsx                           daftar + filter
    create/page.tsx                    form tambah
    [no]/page.tsx                      detail
    [no]/edit/page.tsx                 form edit
    [no]/validasi/page.tsx             form validasi
  api/
    data-input/route.ts                GET list, POST create
    data-input/[no]/route.ts           GET detail, PATCH, DELETE soft
    upload/route.ts                    POST upload foto ke Drive
components/
  PemeriksaanForm.tsx                  form dinamis dari schema kolom
  StatusTag.tsx                        badge status validasi
lib/
  columns.ts                           single source of truth schema kolom
  google.ts                            klien Sheets/Drive (service account)
  sheet.ts                             read/append/patch baris spreadsheet
  drive.ts                             upload foto + util preview URL
  id.ts                                generator NO dan timestamp
```

## Catatan implementasi

- Foto diupload terlebih dahulu sebelum record dibuat, sehingga record baru
  awalnya menggunakan folder Drive sementara `TMP-...`. Anda dapat memindahkan
  file secara manual atau menambah langkah _move_ pasca-create.
- Soft delete menyimpan `IS_DELETED=TRUE` beserta `DELETED_BY` dan
  `DELETED_AT`. Filter daftar menyembunyikan baris terhapus secara default.
- API `GET /api/data-input?includeDeleted=1` mengembalikan semua data termasuk
  yang ditandai dihapus.
- `tsconfig.json` sudah memetakan `@/*` ke root project sehingga import seperti
  `@/lib/columns` dan `@/components/PemeriksaanForm` bekerja tanpa konfigurasi
  tambahan.

## Skrip

```bash
npm run dev      # next dev (Turbopack di Next.js 16)
npm run build    # next build
npm run start    # next start
npm run lint     # eslint
```
