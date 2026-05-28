# Rancangan Aplikasi CRUD Pemeriksaan BPBL Berbasis Spreadsheet dan Google Drive

## 1. Gambaran Umum Aplikasi

Aplikasi ini dirancang untuk membuat sistem **CRUD data pemeriksaan BPBL** dengan sumber data utama menggunakan **Google Spreadsheet**, khususnya tab **`DATA INPUT`**. Aplikasi akan dibuat menggunakan **Next.js** dan dapat berjalan di **localhost** maupun dihosting gratis seperti Vercel.

Fokus utama aplikasi:

- Menampilkan data pemeriksaan dari tab `DATA INPUT`.
- Menambah data pemeriksaan baru.
- Mengubah data pemeriksaan yang sudah ada.
- Menghapus atau menandai data sebagai dihapus.
- Mengunggah foto pemeriksaan ke Google Drive.
- Menyimpan link/fileId foto ke kolom foto pada Google Spreadsheet.
- Menambahkan sistem validasi data oleh petugas/admin.

Secara konsep, Google Spreadsheet berfungsi sebagai **database tabular**, sedangkan Google Drive berfungsi sebagai **media penyimpanan file gambar**.

---

## 2. Arsitektur Sistem

Alur kerja aplikasi:

```text
User / Petugas
    ↓
Form aplikasi Next.js
    ↓
API Route / Server Action Next.js
    ↓
Google Sheets API
    ↓
Tab DATA INPUT di Google Spreadsheet
```

Untuk upload gambar:

```text
User upload foto
    ↓
Next.js menerima file
    ↓
Google Drive API upload file
    ↓
Google Drive mengembalikan fileId/link
    ↓
Link/fileId disimpan ke kolom foto di Google Spreadsheet
```

Dengan rancangan ini, data teks dan pilihan disimpan di Spreadsheet, sedangkan file gambar disimpan di Drive agar spreadsheet tetap ringan.

---

## 3. Koneksi Database Menggunakan Spreadsheet

Aplikasi menggunakan Google Spreadsheet sebagai database sederhana. Data akan dibaca dan ditulis melalui **Google Sheets API**.

Credential yang dibutuhkan di `.env.local`:

```env
GOOGLE_CLIENT_EMAIL=service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nISI_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=id_spreadsheet
GOOGLE_DRIVE_FOLDER_ID=id_folder_drive
```

Keterangan:

| Environment Variable | Fungsi |
|---|---|
| `GOOGLE_CLIENT_EMAIL` | Email dari service account Google Cloud |
| `GOOGLE_PRIVATE_KEY` | Private key dari file JSON service account |
| `GOOGLE_SHEET_ID` | ID spreadsheet dari URL Google Sheets |
| `GOOGLE_DRIVE_FOLDER_ID` | ID folder Google Drive untuk menyimpan foto pemeriksaan |

Contoh URL spreadsheet:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

Bagian `SPREADSHEET_ID` itulah yang dimasukkan ke `GOOGLE_SHEET_ID`.

---

## 4. Koneksi Penyimpanan Image Menggunakan Google Drive

Kolom foto pada tab `DATA INPUT` sebaiknya tidak menyimpan file gambar langsung. Yang disimpan adalah **link Google Drive** atau **fileId Google Drive**.

Contoh isi kolom foto:

```text
https://drive.google.com/file/d/FILE_ID/view
```

Atau:

```text
FILE_ID
```

Rekomendasi penyimpanan:

```text
Google Drive Folder: BPBL Uploads
    ├── ID20260411-112346/
    │   ├── foto-mcb.jpg
    │   ├── foto-ksu.jpg
    │   ├── foto-kabel-kontak.jpg
    │   └── ...
    ├── ID20260411-123028/
    │   └── ...
```

Nama folder dapat dibuat berdasarkan kolom `NO`, karena kolom tersebut bersifat unik.

---

## 5. Tab Utama Database

Tab utama yang digunakan:

```text
DATA INPUT
```

Jumlah kolom utama dari file saat ini:

```text
81 kolom, dari kolom A sampai CC
```

Kolom `NO` dapat digunakan sebagai **primary key** atau ID unik data pemeriksaan.

---

## 6. Struktur Kolom Berdasarkan Kelompok Data


### Identitas Data & Pelanggan

| Kolom | Field | Tipe Input |
|---|---|---|
| A | NO | ID unik / primary key |
| B | TANGGAL_SUBMIT | Tanggal-waktu submit |
| C | NO METER | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| D | IDPEL | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| E | NIK | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| F | NAMA | Teks |
| G | ALAMAT | Teks |
| H | KABUPATENKOTA | Teks |
| I | KECAMATAN | Teks |
| J | DESAKELURAHAN | Teks |
| K | NO_NIDI | Teks |
| L | NOSLO | Teks |
| M | MITRA | Teks |
| N | UNIT TUJUAN | Teks |
| O | UP3 TUJUAN | Teks |

### 1. Pemeriksaan MCB

| Kolom | Field | Tipe Input |
|---|---|---|
| P | 1. MERK MCB | Teks merk/brand |
| Q | 1. MCB 10 A | Enum pilihan: SESUAI / TIDAK |
| R | 1. KET MCB | Catatan/keterangan bebas |
| S | 1. FOTO MCB | File image → upload ke Drive, simpan link/fileId di Sheet |

### 2. Pemeriksaan Kabel Sirkit Utama (KSU)

| Kolom | Field | Tipe Input |
|---|---|---|
| T | 2. MERK KABEL SIRKIT UTAMA (KSU)  | Teks merk/brand |
| U | 2. UKURAN KSU MIN 3 X 4 MM | Enum pilihan: SESUAI / TIDAK |
| V | 2. PANJANG KSU 1 METER | Enum pilihan: SESUAI |
| W | 2. KET KSU | Catatan/keterangan bebas |
| X | 2. FOTO KABEL SIRKIT UTAMA | File image → upload ke Drive, simpan link/fileId di Sheet |

### 3. Pemeriksaan Kabel Kotak Kontak

| Kolom | Field | Tipe Input |
|---|---|---|
| Y | 3. MERK KABEL KOTAK KONTAK | Teks merk/brand |
| Z | 3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM | Enum pilihan: SESUAI |
| AA | 3. PANJANG KABEL KOTAK KONTAK 7 M | Enum pilihan: SESUAI |
| AB | 3. KET KABEL KOTAK KONTAK | Catatan/keterangan bebas |
| AC | 3. FOTO KABEL KOTAK KONTAK | File image → upload ke Drive, simpan link/fileId di Sheet |

### 4. Pemeriksaan Kabel Sakelar Tunggal

| Kolom | Field | Tipe Input |
|---|---|---|
| AD | 4. MERK KABEL SAKELAR TUNGGAL | Teks merk/brand |
| AE | 4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM | Enum pilihan: SESUAI |
| AF | 4. KABEL SAKELAR TUNGGAL PANJANG 3 M | Enum pilihan: SESUAI |
| AG | 4. KET KABEL SAKELAR TUNGGAL | Catatan/keterangan bebas |
| AH | 4. FOTO KABEL SAKELAR TUNGGAL | File image → upload ke Drive, simpan link/fileId di Sheet |

### 5. Pemeriksaan Kabel Sakelar Ganda

| Kolom | Field | Tipe Input |
|---|---|---|
| AI | 5. MERK KABEL SAKELAR GANDA | Teks merk/brand |
| AJ | 5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM | Enum pilihan: SESUAI |
| AK | 5. KABEL SAKELAR GANDA PANJANG 3 M | Enum pilihan: SESUAI |
| AL | 5. KET KABEL SAKELAR GANDA | Catatan/keterangan bebas |
| AM | 5. FOTO KABEL SAKELAR GANDA | File image → upload ke Drive, simpan link/fileId di Sheet |

### 6. Pemeriksaan Kabel Lampu

| Kolom | Field | Tipe Input |
|---|---|---|
| AN | 6. MERK KABEL LAMPU | Teks merk/brand |
| AO | 6. KABEL LAMPU UKURAN 2X1.5 MM | Enum pilihan: SESUAI / TIDAK |
| AP | 6. KABEL LAMPU PANJANG 10 M | Enum pilihan: SESUAI / TIDAK |
| AQ | 6. KET KABEL LAMPU | Catatan/keterangan bebas |
| AR | 6. FOTO KABEL LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |

### 7. Pemeriksaan Roset, T-Dos, Klem

| Kolom | Field | Tipe Input |
|---|---|---|
| AS | 7. PEMASANGAN ROSET, T-DOS,KLEM | Enum pilihan: TERPASANG / TIDAK |
| AT | 7. KET ROSET, T-DOS,KLEM | Catatan/keterangan bebas |
| AU | 7. FOTO ROSET, T-DOS,KLEM | File image → upload ke Drive, simpan link/fileId di Sheet |

### 8. Pemeriksaan Lampu

| Kolom | Field | Tipe Input |
|---|---|---|
| AV | 8. MERK LAMPU | Teks merk/brand |
| AW | 8. DAYA LAMPU 10 WATT | Enum pilihan: SESUAI / TIDAK |
| AX | 8. KET LAMPU | Catatan/keterangan bebas |
| AY | 8. FOTO LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |

### 9. Pemeriksaan Kotak Kontak

| Kolom | Field | Tipe Input |
|---|---|---|
| AZ | 9. MERK KOTAK KONTAK | Teks merk/brand |
| BA | 9. KOTAK KONTAK TIPE C | Enum pilihan: SESUAI |
| BB | 9. KOTAK KONTAK KUNINGAN | Enum pilihan: SESUAI |
| BC | 9. KET KOTAK KONTAK | Catatan/keterangan bebas |
| BD | 9. FOTO KOTAK KONTAK | File image → upload ke Drive, simpan link/fileId di Sheet |

### 10. Pemeriksaan Sakelar Tunggal

| Kolom | Field | Tipe Input |
|---|---|---|
| BE | 10. MERK SAKELAR TUNGGAL | Teks merk/brand |
| BF | 10. KET SAKELAR TUNGGAL | Catatan/keterangan bebas |
| BG | 10. FOTO SAKELAR TUNGGAL | File image → upload ke Drive, simpan link/fileId di Sheet |

### 11. Pemeriksaan Sakelar Ganda

| Kolom | Field | Tipe Input |
|---|---|---|
| BH | 11. MERK SAKELAR GANDA | Teks merk/brand |
| BI | 11. KET SAKELAR GANDA | Catatan/keterangan bebas |
| BJ | 11. FOTO SAKELAR GANDA | File image → upload ke Drive, simpan link/fileId di Sheet |

### 12. Pemeriksaan Fitting Lampu

| Kolom | Field | Tipe Input |
|---|---|---|
| BK | 12. MERK FITTING LAMPU | Teks merk/brand |
| BL | 12. KET FITTING LAMPU | Catatan/keterangan bebas |
| BM | 12. FOTO FITTING LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |

### 13. Pemeriksaan Earthing Rod

| Kolom | Field | Tipe Input |
|---|---|---|
| BN | 13. PEMASANGAN EARTHING ROD | Enum pilihan: TERPASANG / TIDAK |
| BO | 13. DIAMETER EARTHING ROD | Enum pilihan: SESUAI / TIDAK |
| BP | 13. KET EARTHING ROD | Catatan/keterangan bebas |
| BQ | 13. FOTO EARTHING ROD | File image → upload ke Drive, simpan link/fileId di Sheet |

### 14. Pemeriksaan Earthing Konduktor

| Kolom | Field | Tipe Input |
|---|---|---|
| BR | 14. MERK EARTHING KONDUKTOR | Teks merk/brand |
| BS | 14. EARTHING KONDUKTOR TEMBAGA | Enum pilihan: SESUAI / TIDAK |
| BT | 14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA | Enum pilihan: SESUAI / TIDAK |
| BU | 14. KET EARTHING KONDUKTOR | Catatan/keterangan bebas |
| BV | 14. FOTO EARTHING KONDUKTOR | File image → upload ke Drive, simpan link/fileId di Sheet |

### 15. Pemeriksaan Stiker

| Kolom | Field | Tipe Input |
|---|---|---|
| BW | 15. PEMASANGAN STIKER | Enum pilihan: TERPASANG / TIDAK |
| BX | 15. FOTO STIKER | File image → upload ke Drive, simpan link/fileId di Sheet |

### 16. Pemeriksaan Dokumen SLO

| Kolom | Field | Tipe Input |
|---|---|---|
| BY | 16. PENYERAHAN DOK SLO | Enum pilihan: DITERIMA |
| BZ | 16. FOTO SLO | File image → upload ke Drive, simpan link/fileId di Sheet |

### 17. Keterangan Tambahan & Foto Pelanggan

| Kolom | Field | Tipe Input |
|---|---|---|
| CA | 17. KET TAMBAHAN | Catatan/keterangan bebas |
| CB | 17. FOTO BERSAMA PELANGGAN | File image → upload ke Drive, simpan link/fileId di Sheet |
| CC | KOORDINAT | Koordinat GPS teks: latitude, longitude |


---

## 7. Daftar Lengkap Kolom Tab DATA INPUT

| Kolom Excel | No | Nama Kolom | Rekomendasi Tipe/Input |
|---|---:|---|---|
| A | 1 | NO | ID unik / primary key |
| B | 2 | TANGGAL_SUBMIT | Tanggal-waktu submit |
| C | 3 | NO METER | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| D | 4 | IDPEL | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| E | 5 | NIK | Nomor/ID pelanggan, simpan sebagai teks agar digit tidak berubah |
| F | 6 | NAMA | Teks |
| G | 7 | ALAMAT | Teks |
| H | 8 | KABUPATENKOTA | Teks |
| I | 9 | KECAMATAN | Teks |
| J | 10 | DESAKELURAHAN | Teks |
| K | 11 | NO_NIDI | Teks |
| L | 12 | NOSLO | Teks |
| M | 13 | MITRA | Teks |
| N | 14 | UNIT TUJUAN | Teks |
| O | 15 | UP3 TUJUAN | Teks |
| P | 16 | 1. MERK MCB | Teks merk/brand |
| Q | 17 | 1. MCB 10 A | Enum pilihan: SESUAI / TIDAK |
| R | 18 | 1. KET MCB | Catatan/keterangan bebas |
| S | 19 | 1. FOTO MCB | File image → upload ke Drive, simpan link/fileId di Sheet |
| T | 20 | 2. MERK KABEL SIRKIT UTAMA (KSU)  | Teks merk/brand |
| U | 21 | 2. UKURAN KSU MIN 3 X 4 MM | Enum pilihan: SESUAI / TIDAK |
| V | 22 | 2. PANJANG KSU 1 METER | Enum pilihan: SESUAI |
| W | 23 | 2. KET KSU | Catatan/keterangan bebas |
| X | 24 | 2. FOTO KABEL SIRKIT UTAMA | File image → upload ke Drive, simpan link/fileId di Sheet |
| Y | 25 | 3. MERK KABEL KOTAK KONTAK | Teks merk/brand |
| Z | 26 | 3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM | Enum pilihan: SESUAI |
| AA | 27 | 3. PANJANG KABEL KOTAK KONTAK 7 M | Enum pilihan: SESUAI |
| AB | 28 | 3. KET KABEL KOTAK KONTAK | Catatan/keterangan bebas |
| AC | 29 | 3. FOTO KABEL KOTAK KONTAK | File image → upload ke Drive, simpan link/fileId di Sheet |
| AD | 30 | 4. MERK KABEL SAKELAR TUNGGAL | Teks merk/brand |
| AE | 31 | 4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM | Enum pilihan: SESUAI |
| AF | 32 | 4. KABEL SAKELAR TUNGGAL PANJANG 3 M | Enum pilihan: SESUAI |
| AG | 33 | 4. KET KABEL SAKELAR TUNGGAL | Catatan/keterangan bebas |
| AH | 34 | 4. FOTO KABEL SAKELAR TUNGGAL | File image → upload ke Drive, simpan link/fileId di Sheet |
| AI | 35 | 5. MERK KABEL SAKELAR GANDA | Teks merk/brand |
| AJ | 36 | 5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM | Enum pilihan: SESUAI |
| AK | 37 | 5. KABEL SAKELAR GANDA PANJANG 3 M | Enum pilihan: SESUAI |
| AL | 38 | 5. KET KABEL SAKELAR GANDA | Catatan/keterangan bebas |
| AM | 39 | 5. FOTO KABEL SAKELAR GANDA | File image → upload ke Drive, simpan link/fileId di Sheet |
| AN | 40 | 6. MERK KABEL LAMPU | Teks merk/brand |
| AO | 41 | 6. KABEL LAMPU UKURAN 2X1.5 MM | Enum pilihan: SESUAI / TIDAK |
| AP | 42 | 6. KABEL LAMPU PANJANG 10 M | Enum pilihan: SESUAI / TIDAK |
| AQ | 43 | 6. KET KABEL LAMPU | Catatan/keterangan bebas |
| AR | 44 | 6. FOTO KABEL LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |
| AS | 45 | 7. PEMASANGAN ROSET, T-DOS,KLEM | Enum pilihan: TERPASANG / TIDAK |
| AT | 46 | 7. KET ROSET, T-DOS,KLEM | Catatan/keterangan bebas |
| AU | 47 | 7. FOTO ROSET, T-DOS,KLEM | File image → upload ke Drive, simpan link/fileId di Sheet |
| AV | 48 | 8. MERK LAMPU | Teks merk/brand |
| AW | 49 | 8. DAYA LAMPU 10 WATT | Enum pilihan: SESUAI / TIDAK |
| AX | 50 | 8. KET LAMPU | Catatan/keterangan bebas |
| AY | 51 | 8. FOTO LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |
| AZ | 52 | 9. MERK KOTAK KONTAK | Teks merk/brand |
| BA | 53 | 9. KOTAK KONTAK TIPE C | Enum pilihan: SESUAI |
| BB | 54 | 9. KOTAK KONTAK KUNINGAN | Enum pilihan: SESUAI |
| BC | 55 | 9. KET KOTAK KONTAK | Catatan/keterangan bebas |
| BD | 56 | 9. FOTO KOTAK KONTAK | File image → upload ke Drive, simpan link/fileId di Sheet |
| BE | 57 | 10. MERK SAKELAR TUNGGAL | Teks merk/brand |
| BF | 58 | 10. KET SAKELAR TUNGGAL | Catatan/keterangan bebas |
| BG | 59 | 10. FOTO SAKELAR TUNGGAL | File image → upload ke Drive, simpan link/fileId di Sheet |
| BH | 60 | 11. MERK SAKELAR GANDA | Teks merk/brand |
| BI | 61 | 11. KET SAKELAR GANDA | Catatan/keterangan bebas |
| BJ | 62 | 11. FOTO SAKELAR GANDA | File image → upload ke Drive, simpan link/fileId di Sheet |
| BK | 63 | 12. MERK FITTING LAMPU | Teks merk/brand |
| BL | 64 | 12. KET FITTING LAMPU | Catatan/keterangan bebas |
| BM | 65 | 12. FOTO FITTING LAMPU | File image → upload ke Drive, simpan link/fileId di Sheet |
| BN | 66 | 13. PEMASANGAN EARTHING ROD | Enum pilihan: TERPASANG / TIDAK |
| BO | 67 | 13. DIAMETER EARTHING ROD | Enum pilihan: SESUAI / TIDAK |
| BP | 68 | 13. KET EARTHING ROD | Catatan/keterangan bebas |
| BQ | 69 | 13. FOTO EARTHING ROD | File image → upload ke Drive, simpan link/fileId di Sheet |
| BR | 70 | 14. MERK EARTHING KONDUKTOR | Teks merk/brand |
| BS | 71 | 14. EARTHING KONDUKTOR TEMBAGA | Enum pilihan: SESUAI / TIDAK |
| BT | 72 | 14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA | Enum pilihan: SESUAI / TIDAK |
| BU | 73 | 14. KET EARTHING KONDUKTOR | Catatan/keterangan bebas |
| BV | 74 | 14. FOTO EARTHING KONDUKTOR | File image → upload ke Drive, simpan link/fileId di Sheet |
| BW | 75 | 15. PEMASANGAN STIKER | Enum pilihan: TERPASANG / TIDAK |
| BX | 76 | 15. FOTO STIKER | File image → upload ke Drive, simpan link/fileId di Sheet |
| BY | 77 | 16. PENYERAHAN DOK SLO | Enum pilihan: DITERIMA |
| BZ | 78 | 16. FOTO SLO | File image → upload ke Drive, simpan link/fileId di Sheet |
| CA | 79 | 17. KET TAMBAHAN | Catatan/keterangan bebas |
| CB | 80 | 17. FOTO BERSAMA PELANGGAN | File image → upload ke Drive, simpan link/fileId di Sheet |
| CC | 81 | KOORDINAT | Koordinat GPS teks: latitude, longitude |

---

## 8. Kolom Foto yang Di-upload ke Google Drive

Kolom berikut sebaiknya menggunakan input file/image di aplikasi:

| Kolom | Nama Kolom | Penyimpanan |
|---|---|---|
| S | 1. FOTO MCB | Upload Drive, simpan link/fileId |
| X | 2. FOTO KABEL SIRKIT UTAMA | Upload Drive, simpan link/fileId |
| AC | 3. FOTO KABEL KOTAK KONTAK | Upload Drive, simpan link/fileId |
| AH | 4. FOTO KABEL SAKELAR TUNGGAL | Upload Drive, simpan link/fileId |
| AM | 5. FOTO KABEL SAKELAR GANDA | Upload Drive, simpan link/fileId |
| AR | 6. FOTO KABEL LAMPU | Upload Drive, simpan link/fileId |
| AU | 7. FOTO ROSET, T-DOS,KLEM | Upload Drive, simpan link/fileId |
| AY | 8. FOTO LAMPU | Upload Drive, simpan link/fileId |
| BD | 9. FOTO KOTAK KONTAK | Upload Drive, simpan link/fileId |
| BG | 10. FOTO SAKELAR TUNGGAL | Upload Drive, simpan link/fileId |
| BJ | 11. FOTO SAKELAR GANDA | Upload Drive, simpan link/fileId |
| BM | 12. FOTO FITTING LAMPU | Upload Drive, simpan link/fileId |
| BQ | 13. FOTO EARTHING ROD | Upload Drive, simpan link/fileId |
| BV | 14. FOTO EARTHING KONDUKTOR | Upload Drive, simpan link/fileId |
| BX | 15. FOTO STIKER | Upload Drive, simpan link/fileId |
| BZ | 16. FOTO SLO | Upload Drive, simpan link/fileId |
| CB | 17. FOTO BERSAMA PELANGGAN | Upload Drive, simpan link/fileId |

Format nama file yang direkomendasikan:

```text
{NO}_foto_mcb_{timestamp}.jpg
{NO}_foto_ksu_{timestamp}.jpg
{NO}_foto_pelanggan_{timestamp}.jpg
```

Contoh:

```text
ID20260411-112346_foto_mcb_20260411_112346.jpg
```

---

## 9. Kolom Enum / Pilihan

Kolom enum sebaiknya dibuat menggunakan input `<select>` agar data konsisten.

### Pilihan `SESUAI / TIDAK`

Digunakan untuk kolom:

- `1. MCB 10 A`
- `2. UKURAN KSU MIN 3 X 4 MM`
- `6. KABEL LAMPU UKURAN 2X1.5 MM`
- `6. KABEL LAMPU PANJANG 10 M`
- `8. DAYA LAMPU 10 WATT`
- `13. DIAMETER EARTHING ROD`
- `14. EARTHING KONDUKTOR TEMBAGA`
- `14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA`

### Pilihan `TERPASANG / TIDAK`

Digunakan untuk kolom:

- `7. PEMASANGAN ROSET, T-DOS,KLEM`
- `13. PEMASANGAN EARTHING ROD`
- `15. PEMASANGAN STIKER`

### Pilihan tetap `SESUAI`

Kolom berikut pada data saat ini hanya memiliki nilai `SESUAI`, namun tetap bisa dibuat sebagai pilihan agar konsisten:

- `2. PANJANG KSU 1 METER`
- `3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM`
- `3. PANJANG KABEL KOTAK KONTAK 7 M`
- `4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM`
- `4. KABEL SAKELAR TUNGGAL PANJANG 3 M`
- `5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM`
- `5. KABEL SAKELAR GANDA PANJANG 3 M`
- `9. KOTAK KONTAK TIPE C`
- `9. KOTAK KONTAK KUNINGAN`

### Pilihan `DITERIMA`

Digunakan untuk:

- `16. PENYERAHAN DOK SLO`

Ke depan dapat diperluas menjadi:

```text
DITERIMA
BELUM DITERIMA
TIDAK ADA
```

---

## 10. Rekomendasi Kolom Tambahan untuk Validasi

Karena aplikasi nanti membutuhkan informasi siapa yang input dan siapa yang validasi, disarankan menambahkan kolom baru setelah kolom `KOORDINAT`.

Kolom tambahan yang direkomendasikan:

| Kolom Baru | Nama Kolom | Fungsi |
|---|---|---|
| CD | INPUT_BY | Nama/email petugas yang menginput data |
| CE | INPUT_AT | Waktu data pertama kali dibuat |
| CF | UPDATED_BY | Nama/email user terakhir yang mengubah data |
| CG | UPDATED_AT | Waktu update terakhir |
| CH | VALIDATION_STATUS | Status validasi data |
| CI | VALIDATED_BY | Nama/email validator |
| CJ | VALIDATED_AT | Waktu validasi |
| CK | VALIDATION_NOTE | Catatan validasi/revisi |
| CL | IS_DELETED | Penanda soft delete |
| CM | DELETED_BY | Nama/email user yang menghapus |
| CN | DELETED_AT | Waktu data dihapus |

Status validasi yang direkomendasikan:

```text
DRAFT
MENUNGGU_VALIDASI
VALID
PERLU_REVISI
DITOLAK
```

Penjelasan status:

| Status | Arti |
|---|---|
| `DRAFT` | Data masih disimpan sementara oleh petugas |
| `MENUNGGU_VALIDASI` | Data sudah dikirim dan menunggu admin/validator |
| `VALID` | Data sudah diperiksa dan disetujui |
| `PERLU_REVISI` | Data perlu diperbaiki oleh petugas |
| `DITOLAK` | Data tidak diterima/ditolak |

---

## 11. Rekomendasi Role Pengguna

Aplikasi sebaiknya memiliki minimal 2 role:

| Role | Hak Akses |
|---|---|
| `PETUGAS` | Tambah data, edit data miliknya sendiri, upload foto, kirim validasi |
| `VALIDATOR` | Melihat semua data, memvalidasi, memberi catatan revisi |
| `ADMIN` | Mengelola semua data, user, dan melakukan hapus data |

Jika ingin lebih sederhana, cukup gunakan:

```text
PETUGAS
ADMIN
```

---

## 12. Rancangan Fitur CRUD

### Create / Tambah Data

Fitur tambah data digunakan petugas untuk mengisi form pemeriksaan.

Proses:

```text
1. Petugas membuka form tambah data.
2. Sistem membuat NO otomatis, misalnya ID20260526-101530.
3. Petugas mengisi data pelanggan dan pemeriksaan.
4. Petugas upload foto pemeriksaan.
5. Foto dikirim ke Google Drive.
6. Link/fileId foto masuk ke kolom foto.
7. Semua data disimpan ke baris baru di tab DATA INPUT.
```

### Read / Tampil Data

Fitur tampil data digunakan untuk menampilkan isi tab `DATA INPUT`.

Tampilan tabel sebaiknya tidak menampilkan semua 81 kolom sekaligus. Tampilkan ringkasan:

| Field | Keterangan |
|---|---|
| NO | ID data pemeriksaan |
| TANGGAL_SUBMIT | Waktu submit |
| IDPEL | ID pelanggan |
| NAMA | Nama pelanggan |
| MITRA | Nama mitra |
| UNIT TUJUAN | Unit tujuan |
| VALIDATION_STATUS | Status validasi |
| Aksi | Detail, Edit, Hapus, Validasi |

Untuk melihat semua kolom, gunakan halaman detail.

### Update / Edit Data

Fitur edit data digunakan untuk memperbaiki data.

Proses:

```text
1. User memilih data berdasarkan NO.
2. Sistem mencari baris yang sesuai di Spreadsheet.
3. Form diisi otomatis dengan data lama.
4. User mengubah data.
5. Jika ada foto baru, foto lama dapat dibiarkan atau diganti.
6. Sistem update baris di Spreadsheet.
7. Kolom UPDATED_BY dan UPDATED_AT diperbarui.
```

### Delete / Hapus Data

Untuk spreadsheet, disarankan menggunakan **soft delete**, bukan menghapus baris permanen.

Contoh:

```text
IS_DELETED = TRUE
DELETED_BY = nama user
DELETED_AT = waktu hapus
```

Keuntungan soft delete:

- Data tidak hilang permanen.
- Riwayat tetap aman.
- Lebih cocok untuk data pemeriksaan lapangan.

---

## 13. Rekomendasi Struktur Halaman Aplikasi

```text
/app
  /page.jsx
  /data-input
    /page.jsx              → tabel data pemeriksaan
    /create/page.jsx       → form tambah data
    /[no]/page.jsx         → detail data
    /[no]/edit/page.jsx    → edit data
    /[no]/validasi/page.jsx → validasi data
  /api
    /data-input/route.js   → GET dan POST
    /data-input/[no]/route.js → GET detail, PATCH, DELETE
    /upload/route.js       → upload image ke Google Drive
```

---

## 14. Rekomendasi Struktur Form

Karena jumlah kolom sangat banyak, form sebaiknya dibagi menjadi beberapa bagian:

```text
1. Data Pelanggan
2. Pemeriksaan MCB
3. Pemeriksaan Kabel
4. Pemeriksaan Lampu dan Sakelar
5. Pemeriksaan Earthing
6. Dokumen dan Foto
7. Koordinat
8. Validasi
```

Tujuannya agar form tidak terlalu panjang dan lebih mudah digunakan.

---

## 15. Rekomendasi Validasi Input

Validasi yang perlu diterapkan:

| Field | Aturan |
|---|---|
| NO | Wajib, unik |
| TANGGAL_SUBMIT | Wajib |
| IDPEL | Wajib jika data pelanggan lengkap |
| NIK | Simpan sebagai teks |
| NO METER | Simpan sebagai teks |
| Foto | Wajib untuk setiap item pemeriksaan |
| Enum | Harus sesuai pilihan |
| KOORDINAT | Format `latitude, longitude` |
| VALIDATION_STATUS | Harus salah satu status validasi |

Contoh validasi koordinat:

```text
-5.376248, 105.221963
```

---

## 16. Catatan Penting Implementasi

1. Jangan simpan credential Google di frontend.
2. Semua akses Google Sheets dan Google Drive harus dilakukan di server-side Next.js.
3. File `.env.local` jangan di-upload ke GitHub.
4. Kolom nomor seperti `NIK`, `IDPEL`, dan `NO METER` sebaiknya diperlakukan sebagai teks agar digit tidak berubah.
5. Untuk upload gambar, batasi ukuran file agar aplikasi tidak lambat.
6. Gunakan kompresi gambar jika foto dari HP terlalu besar.
7. Simpan `fileId` Drive agar lebih mudah dikelola daripada hanya menyimpan link.
8. Gunakan soft delete agar data tidak hilang permanen.

---

## 17. Kesimpulan

Aplikasi ini dapat dibuat menggunakan:

```text
Next.js sebagai frontend dan backend
Google Spreadsheet sebagai database tabular
Google Drive sebagai penyimpanan foto
Google Sheets API untuk CRUD data
Google Drive API untuk upload image
```

Rancangan ini cocok untuk aplikasi pemeriksaan lapangan karena:

- Mudah dibuat.
- Tidak perlu database server terpisah.
- Bisa berjalan di localhost.
- Bisa dikembangkan menjadi aplikasi online.
- Data tetap bisa dibuka manual melalui Google Spreadsheet.
- Foto tersimpan rapi di Google Drive.
- Ada sistem validasi data oleh admin/validator.
