# Analisis Kolom Pilihan / Enum - Tab DATA INPUT BPBL

Dokumen ini berisi analisis kolom pada tab **DATA INPUT** yang cocok dibuat sebagai pilihan value/dropdown di aplikasi CRUD Next.js. Data sumber berasal dari file spreadsheet **Salinan dari PEMERIKSAAN BPBL.xlsx**.

## Ringkasan Struktur

- Tab yang dianalisis: **DATA INPUT**
- Jumlah kolom: **81 kolom** dari **A sampai CC**
- Kolom pemeriksaan material/foto umumnya memiliki sekitar **609 data terisi**
- Kolom `TANGGAL_SUBMIT` dan `KOORDINAT` memiliki sekitar **632 data terisi**
- Untuk aplikasi CRUD, kolom bisa dibagi menjadi: data identitas, data lokasi, data pemeriksaan, data keterangan, data foto, koordinat, dan data validasi tambahan

## Rekomendasi Umum Untuk Aplikasi

Gunakan tipe input berikut:

| Jenis Kolom | Rekomendasi Input | Keterangan |
|---|---|---|
| Identitas pelanggan | Text / number string | Jangan pakai number murni untuk ID panjang agar tidak berubah menjadi format scientific notation |
| Lokasi / mitra / unit | Dropdown dari master data | Bisa dibuat dari daftar value unik yang ditemukan |
| Merk material | Dropdown + opsi input baru | Banyak typo/variasi kapital, sebaiknya dinormalisasi |
| Status pemeriksaan | Dropdown enum | Contoh: `SESUAI`, `TIDAK`, `TERPASANG`, `DITERIMA` |
| Kolom KET | Dropdown ringkas + catatan bebas | Data lama banyak campuran value, typo, merk, dan keterangan manual |
| Foto | Upload file | File disimpan ke Google Drive, link/fileId disimpan ke Spreadsheet |
| Validasi | Dropdown status validasi | Tambahkan kolom baru untuk workflow admin/validator |

---

## 1. Kolom Status Pemeriksaan Yang Cocok Menjadi Dropdown Enum

Kolom di bawah ini sangat cocok dibuat sebagai `<select>` karena nilainya terbatas dan berfungsi sebagai hasil pemeriksaan.

| Kolom | Nama Kolom | Value ditemukan di spreadsheet | Rekomendasi value aplikasi |
|---|---|---|---|
| Q | 1. MCB 10 A | `SESUAI` (606), `TIDAK` (3) | `SESUAI`, `TIDAK` |
| U | 2. UKURAN KSU MIN 3 X 4 MM | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| V | 2. PANJANG KSU 1 METER | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| Z | 3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AA | 3. PANJANG KABEL KOTAK KONTAK 7 M | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AE | 4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AF | 4. KABEL SAKELAR TUNGGAL PANJANG 3 M | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AJ | 5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AK | 5. KABEL SAKELAR GANDA PANJANG 3 M | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| AO | 6. KABEL LAMPU UKURAN 2X1.5 MM | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| AP | 6. KABEL LAMPU PANJANG 10 M | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| AS | 7. PEMASANGAN ROSET, T-DOS,KLEM | `TERPASANG` (607), `TIDAK` (2) | `TERPASANG`, `TIDAK` |
| AW | 8. DAYA LAMPU 10 WATT | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| BA | 9. KOTAK KONTAK TIPE C | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| BB | 9. KOTAK KONTAK KUNINGAN | `SESUAI` (609) | `SESUAI`, `TIDAK` |
| BN | 13. PEMASANGAN EARTHING ROD | `TERPASANG` (608), `TIDAK` (1) | `TERPASANG`, `TIDAK` |
| BO | 13. DIAMETER EARTHING ROD | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| BS | 14. EARTHING KONDUKTOR TEMBAGA | `SESUAI` (608), `TIDAK` (1) | `SESUAI`, `TIDAK` |
| BT | 14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA | `SESUAI` (607), `TIDAK` (2) | `SESUAI`, `TIDAK` |
| BW | 15. PEMASANGAN STIKER | `TERPASANG` (606), `TIDAK` (3) | `TERPASANG`, `TIDAK` |
| BY | 16. PENYERAHAN DOK SLO | `DITERIMA` (609) | `DITERIMA`, `BELUM DITERIMA`, `TIDAK ADA` |

Catatan: walaupun beberapa kolom saat ini hanya berisi `SESUAI`, aplikasi tetap sebaiknya menyediakan pilihan `TIDAK` agar data pemeriksaan baru bisa mencatat ketidaksesuaian.

---

## 2. Kolom KET / Keterangan

Kolom `KET` terlihat seperti kolom keterangan manual. Dari data lama, nilainya tidak bersih karena berisi campuran status, merk, ukuran, titik `.`, typo, dan catatan bebas. Karena itu, di aplikasi sebaiknya jangan langsung menjadikan seluruh value lama sebagai enum utama.

### Rekomendasi Desain KET di Aplikasi

Untuk setiap item pemeriksaan, buat 2 field:

| Field Baru | Tipe | Value / Format |
|---|---|---|
| `ket_status` | Dropdown | `ADA`, `TIDAK ADA`, `TERPASANG`, `TIDAK TERPASANG`, `BERFUNGSI`, `TIDAK BERFUNGSI`, `SESUAI`, `TIDAK SESUAI`, `BAIK`, `PERLU PERBAIKAN`, `LAINNYA` |
| `ket_catatan` | Textarea | Catatan bebas seperti merk, panjang aktual, kondisi, atau penjelasan tambahan |

### Value KET yang ditemukan di spreadsheet

| Kolom | Nama Kolom | Jumlah Unique | Value ditemukan |
|---|---|---:|---|
| R | 1. KET MCB | 31 | `Sesuai` (152), `Ada` (75), `.` (74), `Terpasang` (63), `ada` (50), `Tami` (41), `baik` (15), `Seduai` (12), `Baik` (10), `Itami` (9), `Berfungsi` (6), `Seusai` (4), `Elektro` (3), `ABB` (2), `Normal` (2), `SESUAI` (2), `4 amper` (2), `Dutron` (1), `Sni` (1), `Fuson` (1), `Elktro` (1), `Terpantau` (1), `terpasang` (1), `berfungsi` (1), `Mcb` (1), `Flashycom` (1), `ADA` (1), `Seu` (1), `MCB LUAR KWH` (1), `4. Amper` (1), `Terapasang` (1) |
| W | 2. KET KSU | 24 | `Sesuai` (158), `.` (87), `Ada` (64), `Terpasang` (56), `ada` (52), `Eterna` (19), `Wilson` (16), `baik` (14), `Enterna` (11), `Baik` (10), `95cm` (9), `93cm` (7), `Seduai` (7), `94cm` (5), `SESUAI` (4), `Intrna` (2), `Sni` (1), `92cm` (1), `Jembo` (1), `1m` (1), `Eternal` (1), `Intrnal` (1), `40 cm` (1), `Se` (1) |
| AB | 3. KET KABEL KOTAK KONTAK | 38 | `Sesuai` (158), `.` (85), `Ada` (65), `Terpasang` (54), `ada` (49), `Senmi` (30), `baik` (15), `Baik` (9), `6,6m` (7), `Seduai` (7), `Pioline` (6), `6,5m` (5), `Ichiyama` (5), `Total` (5), `6,4cm` (2), `Jembo` (2), `6,4m` (2), `SESUAI` (2), `.ada` (1), `..` (1), `6,7` (1), `6,60m` (1), `6,4 m` (1), `Eterna` (1), `6,7m` (1), `Panjang sesuai` (1), `6,5` (1), `Chiyama` (1), `Sen` (1), `Seusai` (1), `3m` (1), `Piolin` (1), `Panasonic` (1), `Desuai` (1), `adaa` (1), `6,8cm` (1), `Standar` (1), `Terapasang` (1) |
| AG | 4. KET KABEL SAKELAR TUNGGAL | 25 | `Sesuai` (159), `.` (86), `Ada` (62), `Terpasang` (55), `ada` (50), `Pioline` (18), `2,8m` (15), `baik` (14), `Shoji` (14), `Seduai` (10), `Eltrik` (9), `Baik` (9), `Senmi` (7), `2,7m` (4), `SESUAI` (2), `Piolin` (2), `2,8 m` (1), `2,9m` (1), `Hongsan` (1), `Piolene` (1), `-` (1), `..` (1), `3m` (1), `Standar` (1), `Etetna` (1) |
| AL | 5. KET KABEL SAKELAR GANDA | 30 | `Sesuai` (160), `.` (92), `Ada` (61), `Terpasang` (55), `ada` (50), `Senmi` (32), `baik` (14), `Ichiyama` (11), `2,7m` (8), `Baik` (8), `2,8m` (7), `Seduai` (6), `Pioline` (2), `2,9m` (2), `SESUAI` (2), `Shoji` (2), `Sebmi` (2), `Sni` (1), `2,6` (1), `2,7` (1), `Afa` (1), `2,8` (1), `ba` (1), `2,6m` (1), `Chiyama` (1), `3m` (1), `1mtr` (1), `Seusai` (1), `2.8m` (1), `Standar` (1) |
| AQ | 6. KET KABEL LAMPU | 31 | `Sesuai` (156), `.` (94), `Ada` (61), `Terpasang` (55), `ada` (50), `Pioline` (23), `Shoji` (16), `baik` (14), `Baik` (9), `Eltrik` (8), `9,4m` (8), `Seduai` (7), `Senmi` (4), `9,5` (3), `9,5m` (3), `Hongsan` (2), `9,6m` (2), `SESUAI` (2), `Piolin` (2), `Sesuia` (1), `9,3m` (1), `b` (1), `9,7` (1), `nyala` (1), `Sesui` (1), `Semmi` (1), `7,5 m` (1), `Sey` (1), `Kabel lampu tdk terpakai` (1), `9,7m` (1), `Hidup` (1) |
| AT | 7. KET ROSET, T-DOS,KLEM | 23 | `Terpasang` (145), `.` (96), `Ada` (63), `Roset` (54), `ada` (50), `Sesuai` (42), `baik` (14), `Kloset` (11), `Baik` (11), `Seduai` (7), `Keloset` (6), `TERPASANG` (6), `terpasang` (4), `T-DOS` (4), `Tdos terpasang` (2), `.ada` (1), `b` (1), `Roset terpasang` (1), `Didak` (1), `Sesu` (1), `Sudah terpasang` (1), `Terasang` (1), `Tepasang` (1) |
| AX | 8. KET LAMPU | 17 | `Sesuai` (140), `.` (92), `Ada` (60), `Terpasang` (54), `Detik` (53), `ada` (50), `Nyala` (39), `baik` (15), `Baik` (9), `nyala` (4), `Seduai` (3), `SESUAI` (2), `Sudah diganti oleh pelanggan` (1), `Seusai` (1), `Lampu teras tdk terpasang` (1), `Hidup` (1), `Tetpasang` (1) |
| BC | 9. KET KOTAK KONTAK | 24 | `Sesuai` (153), `.` (87), `Ada` (67), `Terpasang` (53), `ada` (50), `Panasonic` (36), `Berfungsi` (17), `baik` (15), `Panasonioc` (13), `Baik` (12), `Seduai` (8), `berfungsi` (3), `Politron` (2), `Panasonik` (2), `.sesuai` (2), `Seusai` (2), `SESUAI` (2), `Nyala` (1), `sudah di ganti` (1), `Pansonic` (1), `Sey` (1), `Terasang` (1), `Terapasang` (1), `Tetpasang` (1) |
| BF | 10. KET SAKELAR TUNGGAL | 17 | `Sesuai` (160), `.` (91), `Ada` (64), `Terpasang` (55), `Pioline` (50), `ada` (50), `Berfungsi` (16), `baik` (15), `Baik` (10), `Seduai` (6), `Piolin` (5), `berfungsi` (4), `SESUAI` (2), `Nyala` (1), `Diubah oleh pelanggan` (1), `Tidak terpakai` (1), `Tetpasang` (1) |
| BI | 11. KET SAKELAR GANDA | 22 | `Sesuai` (155), `.` (89), `Ada` (62), `Terpasang` (56), `Pioline` (51), `ada` (50), `Berfungsi` (15), `baik` (15), `Baik` (11), `Seduai` (6), `Piolin` (4), `berfungsi` (4), `SESUAI` (2), `Senmi` (1), `Nyala` (1), `Panasonic` (1), `Piyolin` (1), `Selesai` (1), `Dutron` (1), `Seusai` (1), `Ads` (1), `Tetpasang` (1) |
| BL | 12. KET FITTING LAMPU | 17 | `Sesuai` (153), `.` (94), `Terpasang` (72), `Ada` (64), `Myvo` (51), `ada` (50), `baik` (15), `Baik` (10), `Seduai` (9), `terpasang` (4), `Berfungsi` (2), `SESUAI` (2), `Mypo` (1), `Nyala` (1), `,` (1), `Tidak terpasang` (1), `Aa` (1) |
| BP | 13. KET EARTHING ROD | 23 | `Sesuai` (147), `.` (98), `Terpasang` (66), `Ada` (62), `ada` (50), `1m` (45), `baik` (15), `Baik` (13), `Seduai` (8), `Eterna` (2), `terpasang` (2), `Wilson` (2), `1M` (2), `2,8` (1), `Besi` (1), `sesuai` (1), `sesuia` (1), `SESUAI` (1), `TERPASANG` (1), `Seusai` (1), `.sesuai` (1), `Tidak terpasang` (1), `Tetpasang` (1) |
| BU | 14. KET EARTHING KONDUKTOR | 23 | `Sesuai` (155), `.` (92), `Ada` (64), `Terpasang` (61), `ada` (50), `2,8` (32), `baik` (14), `Seduai` (12), `Baik` (11), `2.8` (8), `Wilson` (5), `Eterna` (3), `2, 8` (3), `terpasang` (2), `SESUAI` (2), `Tetpasang` (2), `28` (1), `sesuai` (1), `ETERNA` (1), `1,8` (1), `Seusai` (1), `Sey` (1), `Tidak terpasang` (1) |
| CA | 17. KET TAMBAHAN | 38 | `.` (119), `Ada` (57), `Foto pelanggan` (55), `Ok` (50), `ada` (48), `Diterima` (34), `Sesuai` (15), `Sudah diberikan` (13), `Semua baik` (13), `Baik` (4), `Tidak ada masalah` (4), `Semua sesuai` (3), `Foto` (3), `Tidak ada masalah, semua terpasang` (3), `Slo sudah diberikan` (2), `..` (2), `Seduai` (2), `Bagus` (1), `Oke` (1), `baik` (1), `Pemilik rumah tidak ada di rumah` (1), `Pemilik sedang kerja` (1), `sudah diberikna` (1), `Sudah berikan` (1), `sudah di terima` (1), `sudah diberi` (1), `Foto penerima` (1), `SESUAI` (1), `Instalasi sudah dirubah oleh pelanggan` (1), `Semua normal` (1), `Semua berfungsi` (1), `Sesua baik` (1), `8` (1), `Semau baik` (1), `Ada masalah, fitting lampu diganti, grounding dilepas` (1), `Lampu teras tdk terpasang` (1), `adad` (1), `Nol` (1) |

### Mapping Normalisasi KET yang Disarankan

| Data lama / contoh | Normalisasi ke value aplikasi |
|---|---|
| `Ada`, `ada` | `ADA` |
| `Terpasang`, `terpasang` | `TERPASANG` |
| `Sesuai`, `SESUAI`, `Seduai`, `Seusai` | `SESUAI` |
| `Baik`, `baik`, `Normal`, `Berfungsi`, `Nyala` | `BAIK` atau `BERFUNGSI` |
| `.`, `,` | kosong / tidak diisi |
| Ukuran seperti `95cm`, `2,8m`, `6,6m`, `1m` | simpan ke `ket_catatan` atau field ukuran aktual |
| Merk seperti `Eterna`, `Wilson`, `Pioline`, `Myvo`, `Tami` | sebaiknya masuk ke kolom merk, bukan KET |

---

## 3. Kolom Master Data Lokasi dan Mitra

Kolom ini cocok menjadi dropdown master karena nilainya terbatas dan sering dipakai ulang.

| Kolom | Nama Kolom | Jumlah Unique | Value ditemukan |
|---|---|---:|---|
| H | KABUPATENKOTA | 10 | `KAB. LAMPUNG TENGAH` (250), `KAB. LAMPUNG SELATAN` (233), `KAB. WAY KANAN` (38), `KAB. MESUJI` (30), `KAB. PESISIR BARAT` (16), `KAB. TANGGAMUS` (15), `KAB. LAMPUNG BARAT` (10), `KAB. LAMPUNG UTARA` (6), `KAB. TULANG BAWANG BARAT` (6), `KAB. TULANG BAWANG` (2) |
| I | KECAMATAN | 26 | `BEKRI` (105), `JATI AGUNG` (85), `NATAR` (49), `SEPUTIH SURABAYA` (41), `TANJUNG SARI` (39), `PUBIAN` (34), `ANAK TUHA` (33), `SIDOMULYO` (31), `SELAGAI LINGGA` (29), `TANJUNG RAYA` (27), `BANJIT` (23), `TANJUNG BINTANG` (22), `NEGERI AGUNG` (15), `LEMONG` (11), `GEDUNG SURIAN` (10), `KOTA AGUNG TIMUR` (9), `WAY SULAN` (7), `ABUNG BARAT` (6), `BANDAR SURABAYA` (6), `TUMIJAJAR` (6), `PESISIR UTARA` (5), `GISTING` (5), `MESUJI TIMUR` (3), `BANJAR AGUNG` (2), `KALIREJO` (2), `GUNUNG ALIP` (1) |
| J | DESAKELURAHAN | 61 | `PURWOTANI` (37), `SINAR REJEKI` (35), `JAYA SAKTI` (33), `BANGUN SARI` (31), `MUARA TENANG` (25), `RIAU PRIANGAN` (24), `WONODADI` (24), `BALI SADAR UTARA` (23), `BANDAREJO` (23), `WAY GALIH` (22), `KESUMA JAYA` (22), `SINAR BANTEN` (21), `BINJAI NGAGUNG` (20), `KENANGA SARI` (18), `TANJUNG REJO` (15), `KARANG ANYAR` (15), `TANJUNG SARI` (15), `SIDOMUKTI` (14), `SIDODADI` (14), `GILIH KARANG JATI` (14), `GAYA BARU III` (13), `GORAS JAYA` (11), `RAWA BETIK` (10), `TIAS BANGUN` (10), `TANJUNG ANOM` (9), `PAMULIHAN` (7), `BANJAR AGUNG` (7), `CAHAYA NEGERI` (6), `SUMBER AGUNG` (6), `MARGO DADI` (6), `MALAYA` (5), `TRI MULYO` (5), `SIDOWALUYO` (5), `SUKAMARGA` (5), `SUKAMAJU` (5), `SIDOHARJO` (4), `CANDI MAS` (4), `BANJAR NEGERI` (4), `TANJUNG MENENG` (3), `GEDUNG SURIAN` (3), `GISTING BAWAH` (3), `HADUYANG` (3), `PADANG RINDU` (2), `MUARA TENANG TIMUR` (2), `WAY BATANG` (2), `MARGODADI` (2), `GISTING ATAS` (2), `TRI TUNGGAL JAYA` (2), `KOTA DALAM` (2), `SRI MULYO` (2), `MEKARJAYA` (1), `LEMONG` (1), `NEGERI RATU` (1), `KERBANG LANGGAR` (1), `BALAM` (1), `MEKAR JAYA` (1), `BANDAR PUGUNG` (1), `RATA AGUNG` (1), `PARDA HAGA` (1), `MULYOSARI` (1), `SUKAMERNAH` (1) |
| M | MITRA | 8 | `PT. FINDI JAYA MANDIRI` (140), `PT. MUSTIKA KURNIA ABADI` (134), `PT. JENDERAL AHMADYANI` (69), `PT. KIKIM KEDURANG JAYA` (65), `PT. ABIAN MUSTAFA MANDIRI` (63), `PT. CAHAYA ATMA MADANI` (51), `PT. AZKA ALGHAZALI LAMPUNG` (46), `PT. ALVARO JAYA` (38) |
| N | UNIT TUJUAN | 14 | `ULP NATAR` (239), `ULP KALIREJO` (84), `ULP SUTAMI` (61), `ULP RUMBIA` (47), `ULP BLAMBANGAN UMPU` (38), `ULP SIDOMULYO` (38), `ULP MESUJI` (30), `ULP LIWA` (26), `ULP BUMI ABUNG` (14), `ULP KOTA AGUNG` (9), `ULP BUKIT KEMUNING` (6), `ULP TALANG PADANG` (6), `ULP PULUNG KENCANA` (6), `ULP MENGGALA` (2) |
| O | UP3 TUJUAN | 4 | `UP3 TANJUNG KARANG` (338), `UP3 PRINGSEWU` (125), `UP3 KOTABUMI` (96), `UP3 METRO` (47) |

Rekomendasi struktur master data:

```text
master_kabupatenkota
master_kecamatan
master_desakelurahan
master_mitra
master_unit_tujuan
master_up3_tujuan
```

Untuk lokasi, dropdown bisa dibuat bertingkat: `KABUPATENKOTA` → `KECAMATAN` → `DESAKELURAHAN`.

---

## 4. Kolom Merk Material

Kolom merk sebaiknya dibuat dropdown, tetapi tetap sediakan opsi **Tambah Merk Baru** karena data lama memiliki banyak variasi penulisan. Contoh masalah: `Eterna`, `ETERNA`, `eterna`, `Enterna`; `Pioline`, `Piolin`, `pioline`; `Powel`, `Powell`, `POWELL`.

| Kolom | Nama Kolom | Jumlah Unique | Value ditemukan |
|---|---|---:|---|
| P | 1. MERK MCB | 34 | `Itami` (136), `Dutron` (130), `Powel` (113), `Push on` (65), `Tami` (40), `Powell` (25), `Elektro` (22), `itami` (19), `POWELL` (12), `Newplas` (8), `ITAMI` (7), `Newpallas` (6), `ELEKTRO` (2), `Push  on` (2), `powel` (2), `Elekto` (2), `Dutrin` (1), `Ditron` (1), `Elekro` (1), `Elektrik` (1), `Duteo` (1), `Dutron jembo` (1), `.` (1), `Duty` (1), `tami` (1), `Push` (1), `Push On` (1), `10` (1), `Itama` (1), `ABB` (1), `Flashycom` (1), `Otami` (1), `Pawell` (1), `Powl` (1) |
| T | 2. MERK KABEL SIRKIT UTAMA (KSU) | 28 | `Eterna` (315), `Metal` (84), `ETERNA` (67), `Enterna` (32), `Jembo` (31), `eterna` (22), `Wilson` (17), `.` (16), `Eyerna` (3), `Interna` (2), `Eternal` (2), `Etetna` (2), `Jemby` (1), `Jembu` (1), `Metel` (1), `Etern` (1), `Pioline` (1), `Intrna` (1), `Eltrix` (1), `Meral` (1), `Eternw` (1), `Senmi` (1), `Intrnal` (1), `Meta l` (1), `NYM` (1), `Simas` (1), `Terpasang` (1), `Eterns` (1) |
| Y | 3. MERK KABEL KOTAK KONTAK | 32 | `Jembo` (128), `Senmi` (84), `Simas` (81), `Eterna` (64), `Pioline` (39), `Ichiyama` (33), `Semmi` (30), `simas` (26), `Total` (24), `Eltrix` (20), `Piolin` (15), `Newca` (11), `newca` (7), `Kenjiro` (7), `.` (5), `Piolene` (4), `total` (4), `ETERNA` (4), `SENMI` (4), `pioline` (3), `panasonic` (2), `senmi` (2), `Panasonic` (2), `Etetna` (2), `Jemy` (1), `ichiyama` (1), `piolin` (1), `ELEXTRIK` (1), `Metal` (1), `Iciama` (1), `NYM` (1), `Eterns` (1) |
| AD | 4. MERK KABEL SAKELAR TUNGGAL | 38 | `Jembo` (117), `Simas` (66), `Pioline` (65), `Eterna` (56), `Shoji` (52), `simas` (45), `Newca` (43), `Senmi` (42), `Semmi` (23), `Hongsan` (18), `Dutron` (10), `miyazaki` (10), `Eltrik` (9), `shoji` (7), `.` (6), `Hongshan` (4), `Eltrix` (4), `Piolene` (3), `Piolin` (3), `Jemy` (2), `PIOLINE` (2), `hongshan` (2), `NEWCA` (2), `Terpasang` (2), `Etetna` (2), `Eterns` (2), `hongsan` (1), `Jeo` (1), `Visalux` (1), `Simas cabel` (1), `Senmi ga` (1), `Swnmi` (1), `Ichiyama` (1), `Miyazaki` (1), `Semi` (1), `NYM` (1), `Philip` (1), `Etrna` (1) |
| AI | 5. MERK KABEL SAKELAR GANDA | 29 | `Jembo` (118), `Senmi` (104), `Pioline` (64), `Eterna` (58), `Simas` (58), `Newca` (49), `simas` (47), `Ichiyama` (27), `senmi` (16), `Eltrix` (15), `Dutron` (12), `Shoji` (9), `ichiyama` (5), `.` (5), `Semmi` (3), `Eterns` (3), `NEWCA` (2), `Sesuai` (2), `Terpasang` (2), `Panasonic` (1), `Pioliene` (1), `Piolene` (1), `PIOLINE` (1), `Chiyama` (1), `SHOJI` (1), `NYM` (1), `Seduai` (1), `Etetna` (1), `Etrna` (1) |
| AN | 6. MERK KABEL LAMPU | 38 | `Jembo` (129), `Pioline` (65), `Simas` (65), `Shoji` (60), `Eterna` (59), `Hongsan` (57), `simas` (46), `Senmi` (29), `Semmi` (28), `miyazaki` (10), `Eltrik` (8), `shoji` (7), `Detik` (4), `Hongshan` (4), `Eltrix` (4), `Best life` (3), `HONGSAN` (3), `Visero` (2), `hongsan` (2), `hongshan` (2), `Ichiyama` (2), `Piolin` (2), `Amalco` (2), `Eterns` (2), `Jemby` (1), `Elektrik` (1), `Jemy` (1), `Piolene` (1), `SENMI` (1), `Destik` (1), `Sesuai` (1), `Miyazaki` (1), `NYM` (1), `Simss` (1), `Hannoch` (1), `Hanock` (1), `Hanoc` (1), `Etrna` (1) |
| AV | 8. MERK LAMPU | 36 | `Detik` (189), `Best life` (123), `Hannocs` (81), `Hanoc` (36), `Amalco` (29), `Hannochs` (22), `detik` (20), `Hanok` (19), `In lite` (16), `Inlite` (13), `Hannoch` (12), `Amasco` (11), `Hanno chs` (4), `Estika` (3), `DETIK` (3), `.` (3), `Visero` (2), `Hanoks` (2), `hannocs` (2), `Best` (2), `Hanov` (2), `Panasonic` (1), `Beslive` (1), `Bestlive` (1), `Best t` (1), `in,lite` (1), `Analco` (1), `estika` (1), `AMASCO` (1), `Energi` (1), `Pioline` (1), `Hanoch` (1), `Best lit` (1), `Best Life` (1), `Sesuai` (1), `Hanock` (1) |
| AZ | 9. MERK KOTAK KONTAK | 24 | `Panasonic` (476), `Philip` (33), `panasonic` (22), `Panasonik` (21), `Dutron` (11), `Broco` (11), `Panasonioc` (8), `Panaaonic` (5), `.` (3), `Politron` (2), `PANASONIC` (2), `Pannasonic` (2), `Philio` (2), `Panasoik` (1), `Visero` (1), `Panasonek` (1), `Panasinic` (1), `Ponasonix` (1), `Panasonix` (1), `Pioline` (1), `Jembo` (1), `Panay` (1), `Eterna` (1), `Tembaga` (1) |
| BE | 10. MERK SAKELAR TUNGGAL | 25 | `Pioline` (244), `Dutron` (123), `Amasco` (86), `Philip` (28), `Piolin` (24), `pioline` (17), `Visalux` (17), `amasco` (17), `Broco` (12), `Jembo` (5), `Eterna` (5), `Panasonic` (4), `.` (4), `Senmi` (3), `piolin` (3), `Asco` (3), `Asero` (3), `PIOLIN` (2), `Visaluk` (2), `Philio` (2), `Piolione` (1), `Puoline` (1), `Amaco` (1), `amaso` (1), `Simas` (1) |
| BH | 11. MERK SAKELAR GANDA | 31 | `Pioline` (239), `Dutron` (127), `Amasco` (64), `amasco` (40), `Philip` (31), `Piolin` (22), `pioline` (16), `Visalux` (16), `Broco` (12), `.` (4), `piolin` (4), `Panasonic` (3), `Asco` (3), `Asero` (3), `Philio` (3), `Senmi` (2), `PIOLINE` (2), `PIOLIN` (2), `.dutron` (2), `Eltrix` (2), `Visaluk` (2), `Duteiy` (1), `pioline.` (1), `Pioy` (1), `Poline` (1), `Eterna` (1), `Newca` (1), `amaso` (1), `Sesuai` (1), `Simas` (1), `Pholip` (1) |
| BK | 12. MERK FITTING LAMPU | 28 | `Visero` (211), `Myvo` (181), `Visalux` (49), `Pagoda` (28), `Hanoc` (23), `visero` (22), `Broco` (18), `pagoda` (17), `Broko` (10), `Philip` (10), `Mayfo` (8), `MYVO` (5), `.` (5), `Visaluk` (4), `myvo` (2), `visalux` (2), `Detik` (2), `Asero` (2), `Panasonic` (1), `Visery` (1), `Pagod` (1), `Best life` (1), `Bruko` (1), `Sesuai` (1), `Asvero` (1), `.visero` (1), `Hanok` (1), `Phili` (1) |
| BR | 14. MERK EARTHING KONDUKTOR | 36 | `Eterna` (154), `.` (128), `Tembaga` (106), `ETERNA` (66), `Wilson` (58), `vertu` (15), `Pralon` (12), `Sucofindo` (12), `Jembo` (8), `Sesuai` (6), `Vilson` (5), `Supreme` (5), `Enterna` (4), `eterna` (4), `Trilion` (3), `Besi` (2), `Trilon` (2), `Elektro` (1), `jembo` (1), `ETERNA di` (1), `Etterna` (1), `2.8` (1), `Vison` (1), `Suprane` (1), `Supeme` (1), `Supermae` (1), `Suparme` (1), `Superme` (1), `Detik` (1), `Myvo` (1), `Vertu` (1), `NYM` (1), `Eyerna` (1), `Triliun` (1), `Trlion` (1), `Sucufindo` (1) |

### Rekomendasi normalisasi merk

- Simpan value merk dalam format konsisten, misalnya Title Case: `Eterna`, `Pioline`, `Dutron`.
- Buat tabel/sheet master `MASTER_MERK` untuk menyimpan daftar merk resmi.
- Saat input, user memilih dari dropdown. Jika merk belum ada, admin dapat menambahkan merk baru.
- Data lama yang typo sebaiknya dibuat mapping normalisasi sebelum dipakai sebagai pilihan resmi.

---

## 5. Kolom Foto / Image

Kolom foto sebaiknya **bukan dropdown**. Di aplikasi Next.js, kolom ini dibuat sebagai upload file. File gambar disimpan ke Google Drive, sedangkan spreadsheet hanya menyimpan `drive_file_id` atau link file.

| Kolom | Nama Kolom | Rekomendasi penyimpanan |
|---|---|---|
| S | 1. FOTO MCB | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| X | 2. FOTO KABEL SIRKIT UTAMA | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AC | 3. FOTO KABEL KOTAK KONTAK | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AH | 4. FOTO KABEL SAKELAR TUNGGAL | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AM | 5. FOTO KABEL SAKELAR GANDA | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AR | 6. FOTO KABEL LAMPU | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AU | 7. FOTO ROSET, T-DOS,KLEM | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| AY | 8. FOTO LAMPU | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BD | 9. FOTO KOTAK KONTAK | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BG | 10. FOTO SAKELAR TUNGGAL | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BJ | 11. FOTO SAKELAR GANDA | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BM | 12. FOTO FITTING LAMPU | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BQ | 13. FOTO EARTHING ROD | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BV | 14. FOTO EARTHING KONDUKTOR | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BX | 15. FOTO STIKER | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| BZ | 16. FOTO SLO | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |
| CB | 17. FOTO BERSAMA PELANGGAN | Upload ke Google Drive, simpan `fileId` / link Drive di Spreadsheet |

Format value yang direkomendasikan:

```text
https://drive.google.com/file/d/FILE_ID/view
```

atau simpan langsung file ID:

```text
1AbCdEfGhIjKlMnOpQrStUvWxYz
```

---

## 6. Kolom Text / Input Bebas

Kolom berikut sebaiknya tetap text/input bebas karena nilainya unik atau berbentuk identitas.

| Kolom | Nama Kolom | Tipe Input | Catatan |
|---|---|---|---|
| A | NO | Text / ID otomatis | Bisa dibuat otomatis, contoh ID timestamp |
| B | TANGGAL_SUBMIT | Datetime | Bisa otomatis diisi saat submit |
| C | NO METER | Text | Jangan number murni agar angka panjang tidak berubah format |
| D | IDPEL | Text | Jangan number murni agar angka panjang tidak berubah format |
| E | NIK | Text | Jangan number murni agar angka panjang tidak berubah format |
| F | NAMA | Text | Input manual |
| G | ALAMAT | Text | Input manual |
| K | NO_NIDI | Text | Jangan number murni agar angka panjang tidak berubah format |
| L | NOSLO | Text | Jangan number murni agar angka panjang tidak berubah format |
| CC | KOORDINAT | Text / koordinat | Format latitude, longitude. Bisa otomatis dari GPS browser jika diizinkan user |

---

## 7. Rancangan Kolom Tambahan Untuk Input dan Validasi

Agar aplikasi punya alur validasi, tambahkan kolom baru setelah `CC KOORDINAT` atau buat tab terpisah `LOG_VALIDASI`.

### Opsi A: Tambah kolom langsung di DATA INPUT

| Kolom Baru | Nama Field | Tipe | Value / Isi | Fungsi |
|---|---|---|---|---|
| CD | INPUT_BY | Text / user email | Nama/email petugas input | Mencatat siapa yang input data |
| CE | INPUT_AT | Datetime | Timestamp otomatis | Mencatat waktu input |
| CF | UPDATED_BY | Text / user email | Nama/email terakhir edit | Mencatat siapa yang terakhir mengubah data |
| CG | UPDATED_AT | Datetime | Timestamp otomatis | Mencatat waktu edit terakhir |
| CH | STATUS_VALIDASI | Dropdown | `DRAFT`, `MENUNGGU_VALIDASI`, `VALID`, `REVISI`, `DITOLAK` | Status proses validasi |
| CI | VALIDATED_BY | Text / user email | Nama/email validator | Mencatat siapa yang memvalidasi |
| CJ | VALIDATED_AT | Datetime | Timestamp otomatis | Mencatat waktu validasi |
| CK | CATATAN_VALIDATOR | Textarea | Catatan revisi/penolakan | Alasan revisi atau catatan pengecekan |
| CL | DRIVE_FOLDER_ID | Text | ID folder Google Drive | Folder penyimpanan foto per pelanggan/record |
| CM | ROW_ID | Text / UUID | ID internal aplikasi | Kunci unik untuk update/delete agar tidak bergantung pada nomor baris spreadsheet |

### Opsi B: Buat tab LOG_VALIDASI

Lebih rapi jika aplikasi butuh riwayat validasi berkali-kali.

| Field | Fungsi |
|---|---|
| `log_id` | ID log validasi |
| `row_id` | ID data pemeriksaan yang divalidasi |
| `status_validasi` | Status validasi saat itu |
| `catatan` | Catatan validator |
| `created_by` | Nama/email validator |
| `created_at` | Waktu validasi |

---

## 8. Contoh Struktur Form Aplikasi

Agar form tidak terlalu panjang, bagi input menjadi beberapa section:

```text
1. Data Pelanggan
   - NO, TANGGAL_SUBMIT, NO METER, IDPEL, NIK, NAMA, ALAMAT

2. Lokasi dan Mitra
   - KABUPATENKOTA, KECAMATAN, DESAKELURAHAN, MITRA, UNIT TUJUAN, UP3 TUJUAN

3. Pemeriksaan Material
   - MCB, KSU, kabel kotak kontak, kabel sakelar, kabel lampu, lampu, kotak kontak, sakelar, fitting, earthing, stiker, SLO

4. Upload Foto
   - Semua kolom FOTO diupload ke Google Drive

5. Validasi
   - STATUS_VALIDASI, VALIDATED_BY, VALIDATED_AT, CATATAN_VALIDATOR
```

---

## 9. Appendix: Daftar Semua Kolom DATA INPUT

| Kolom | Nama Kolom | Rekomendasi Input |
|---|---|---|
| A | NO | Text/input bebas |
| B | TANGGAL_SUBMIT | Datetime otomatis/manual |
| C | NO METER | Text/input bebas |
| D | IDPEL | Text/input bebas |
| E | NIK | Text/input bebas |
| F | NAMA | Text/input bebas |
| G | ALAMAT | Text/input bebas |
| H | KABUPATENKOTA | Dropdown master data |
| I | KECAMATAN | Dropdown master data |
| J | DESAKELURAHAN | Dropdown master data |
| K | NO_NIDI | Text/input bebas |
| L | NOSLO | Text/input bebas |
| M | MITRA | Dropdown master data |
| N | UNIT TUJUAN | Dropdown master data |
| O | UP3 TUJUAN | Dropdown master data |
| P | 1. MERK MCB | Dropdown merk + tambah merk baru |
| Q | 1. MCB 10 A | Dropdown status pemeriksaan |
| R | 1. KET MCB | Dropdown KET + catatan bebas |
| S | 1. FOTO MCB | Upload image ke Google Drive |
| T | 2. MERK KABEL SIRKIT UTAMA (KSU) | Dropdown merk + tambah merk baru |
| U | 2. UKURAN KSU MIN 3 X 4 MM | Dropdown status pemeriksaan |
| V | 2. PANJANG KSU 1 METER | Dropdown status pemeriksaan |
| W | 2. KET KSU | Dropdown KET + catatan bebas |
| X | 2. FOTO KABEL SIRKIT UTAMA | Upload image ke Google Drive |
| Y | 3. MERK KABEL KOTAK KONTAK | Dropdown merk + tambah merk baru |
| Z | 3. UKURAN KABEL KOTAK KONTAK MIN 3X2.5 MM | Dropdown status pemeriksaan |
| AA | 3. PANJANG KABEL KOTAK KONTAK 7 M | Dropdown status pemeriksaan |
| AB | 3. KET KABEL KOTAK KONTAK | Dropdown KET + catatan bebas |
| AC | 3. FOTO KABEL KOTAK KONTAK | Upload image ke Google Drive |
| AD | 4. MERK KABEL SAKELAR TUNGGAL | Dropdown merk + tambah merk baru |
| AE | 4. KABEL SAKELAR TUNGGAL UKURAN 2X1.5 MM | Dropdown status pemeriksaan |
| AF | 4. KABEL SAKELAR TUNGGAL PANJANG 3 M | Dropdown status pemeriksaan |
| AG | 4. KET KABEL SAKELAR TUNGGAL | Dropdown KET + catatan bebas |
| AH | 4. FOTO KABEL SAKELAR TUNGGAL | Upload image ke Google Drive |
| AI | 5. MERK KABEL SAKELAR GANDA | Dropdown merk + tambah merk baru |
| AJ | 5. KABEL SAKELAR GANDA UKURAN 3X1.5 MM | Dropdown status pemeriksaan |
| AK | 5. KABEL SAKELAR GANDA PANJANG 3 M | Dropdown status pemeriksaan |
| AL | 5. KET KABEL SAKELAR GANDA | Dropdown KET + catatan bebas |
| AM | 5. FOTO KABEL SAKELAR GANDA | Upload image ke Google Drive |
| AN | 6. MERK KABEL LAMPU | Dropdown merk + tambah merk baru |
| AO | 6. KABEL LAMPU UKURAN 2X1.5 MM | Dropdown status pemeriksaan |
| AP | 6. KABEL LAMPU PANJANG 10 M | Dropdown status pemeriksaan |
| AQ | 6. KET KABEL LAMPU | Dropdown KET + catatan bebas |
| AR | 6. FOTO KABEL LAMPU | Upload image ke Google Drive |
| AS | 7. PEMASANGAN ROSET, T-DOS,KLEM | Dropdown status pemeriksaan |
| AT | 7. KET ROSET, T-DOS,KLEM | Dropdown KET + catatan bebas |
| AU | 7. FOTO ROSET, T-DOS,KLEM | Upload image ke Google Drive |
| AV | 8. MERK LAMPU | Dropdown merk + tambah merk baru |
| AW | 8. DAYA LAMPU 10 WATT | Dropdown status pemeriksaan |
| AX | 8. KET LAMPU | Dropdown KET + catatan bebas |
| AY | 8. FOTO LAMPU | Upload image ke Google Drive |
| AZ | 9. MERK KOTAK KONTAK | Dropdown merk + tambah merk baru |
| BA | 9. KOTAK KONTAK TIPE C | Dropdown status pemeriksaan |
| BB | 9. KOTAK KONTAK KUNINGAN | Dropdown status pemeriksaan |
| BC | 9. KET KOTAK KONTAK | Dropdown KET + catatan bebas |
| BD | 9. FOTO KOTAK KONTAK | Upload image ke Google Drive |
| BE | 10. MERK SAKELAR TUNGGAL | Dropdown merk + tambah merk baru |
| BF | 10. KET SAKELAR TUNGGAL | Dropdown KET + catatan bebas |
| BG | 10. FOTO SAKELAR TUNGGAL | Upload image ke Google Drive |
| BH | 11. MERK SAKELAR GANDA | Dropdown merk + tambah merk baru |
| BI | 11. KET SAKELAR GANDA | Dropdown KET + catatan bebas |
| BJ | 11. FOTO SAKELAR GANDA | Upload image ke Google Drive |
| BK | 12. MERK FITTING LAMPU | Dropdown merk + tambah merk baru |
| BL | 12. KET FITTING LAMPU | Dropdown KET + catatan bebas |
| BM | 12. FOTO FITTING LAMPU | Upload image ke Google Drive |
| BN | 13. PEMASANGAN EARTHING ROD | Dropdown status pemeriksaan |
| BO | 13. DIAMETER EARTHING ROD | Dropdown status pemeriksaan |
| BP | 13. KET EARTHING ROD | Dropdown KET + catatan bebas |
| BQ | 13. FOTO EARTHING ROD | Upload image ke Google Drive |
| BR | 14. MERK EARTHING KONDUKTOR | Dropdown merk + tambah merk baru |
| BS | 14. EARTHING KONDUKTOR TEMBAGA | Dropdown status pemeriksaan |
| BT | 14. PIPA PELINDUNG EARTHING KONDUKTOR TEMBAGA | Dropdown status pemeriksaan |
| BU | 14. KET EARTHING KONDUKTOR | Dropdown KET + catatan bebas |
| BV | 14. FOTO EARTHING KONDUKTOR | Upload image ke Google Drive |
| BW | 15. PEMASANGAN STIKER | Dropdown status pemeriksaan |
| BX | 15. FOTO STIKER | Upload image ke Google Drive |
| BY | 16. PENYERAHAN DOK SLO | Dropdown status pemeriksaan |
| BZ | 16. FOTO SLO | Upload image ke Google Drive |
| CA | 17. KET TAMBAHAN | Dropdown KET + catatan bebas |
| CB | 17. FOTO BERSAMA PELANGGAN | Upload image ke Google Drive |
| CC | KOORDINAT | Koordinat GPS / text |