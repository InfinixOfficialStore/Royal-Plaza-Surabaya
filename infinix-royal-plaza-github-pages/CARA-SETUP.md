# Cara Setup — Katalog 5 Toko Infinix

Isi folder ini:
- `index.html` — halaman pilih toko
- `store-royal-plaza.html`, `store-galaxy-mall.html`, `store-icon-mall-gresik.html`, `store-gressmall.html`, `store-jember.html` — 1 halaman per cabang, tampilan sama, hanya beda nama toko & filter stok
- `assets/style.css`, `assets/app.js` — dipakai bareng oleh semua halaman

Semua 5 halaman baca data dari **1 Google Sheets yang sama**. Update harga/produk sekali → otomatis muncul di 5 halaman.

---

## LANGKAH 1 — Buat Google Sheets

Buat 1 spreadsheet baru, isi 2 tab (sheet) dengan nama & kolom persis seperti ini:

### Tab `Produk`
| ID_SKU | Kategori | Series | Nama_Produk | Varian | Harga | Foto_URL | Status |
|---|---|---|---|---|---|---|---|
| HP-SM20 | Handphone | Smart Series | Smart 20 | 4/128 Hitam | 1499000 | (link foto) | Aktif |

Nilai kolom **Kategori** harus salah satu dari ini (huruf besar/kecil & tanda kurung harus sama persis):
```
Handphone
Tablet
Laptop (AIOT)
Smart TV (AIOT)
Smart Watch (AIOT)
TWS (AIOT)
Powerbank (AIOT)
Data Cable (AIOT)
Phone Charger (AIOT)
Phone Case (AIOT)
```
Kolom **Harga** isi angka saja (tanpa "Rp" atau titik, contoh: `1499000`).
Kolom **Status**: isi `Aktif` atau `Nonaktif` (produk nonaktif otomatis disembunyikan).
Kolom **Foto_URL** boleh dikosongkan dulu kalau belum ada foto.

### Tab `Stok`
| ID_SKU | Nama_Toko | Stok | Update_Terakhir |
|---|---|---|---|
| HP-SM20 | Royal Plaza | 5 | 22/09/2026 |
| HP-SM20 | Galaxy Mall | 3 | 22/09/2026 |

**Nama_Toko harus persis** salah satu dari 5 ini (sesuai yang dipakai halaman web):
```
Royal Plaza
Galaxy Mall
Icon Mall Gresik
GressMall
Jember
```
Buat 1 baris untuk tiap kombinasi produk × toko (kalau ada 20 produk × 5 toko = 100 baris).

---

## LANGKAH 2 — Publish sheet sebagai CSV

Untuk **masing-masing tab** (Produk & Stok), lakukan terpisah:

1. Buka tab yang mau di-publish (klik tab-nya di bawah, misalnya `Produk`)
2. Menu **File → Share → Publish to web**
3. Di dropdown pertama, pilih tab yang aktif (bukan "Entire document") — pastikan tertulis nama tabnya, misal "Produk"
4. Di dropdown kedua, pilih **Comma-separated values (.csv)**
5. Klik **Publish**, konfirmasi
6. Copy link yang muncul (formatnya diawali `https://docs.google.com/spreadsheets/d/.../pub?...`)
7. Ulangi untuk tab `Stok`

---

## LANGKAH 3 — Masukkan link CSV ke website

Buka file `assets/app.js`, cari baris ini di paling atas:

```js
const SHEET_PRODUK_CSV_URL = "PASTE_LINK_CSV_TAB_PRODUK_DI_SINI";
const SHEET_STOK_CSV_URL   = "PASTE_LINK_CSV_TAB_STOK_DI_SINI";
```

Ganti dengan 2 link yang kamu copy tadi. Simpan file.

---

## LANGKAH 4 — Lengkapi kontak & sosmed tiap toko

Di tiap file `store-*.html`, cari dan ganti:
- `GANTI_USERNAME_IG`, `GANTI_LINK_SHOPEE`, `GANTI_USERNAME_TIKTOK` → link asli akun sosmed toko
- Nomor WhatsApp `6281200000001` dst (di dekat `wa.me/`) → nomor WA asli tiap toko
- Alamat di bagian `__STORE_ADDRESS__` sudah terisi contoh — sesuaikan alamat lengkapnya biar peta (Maps) akurat

---

## LANGKAH 5 — Upload ke Netlify

1. Buka [app.netlify.com](https://app.netlify.com), buat akun gratis (bisa pakai akun Google)
2. Di dashboard, cari kotak **"Drag and drop your site output folder here"**
3. Drag seluruh folder `infinix-catalog` (yang isinya `index.html`, `assets/`, dan 5 file `store-*.html`) ke kotak itu
4. Tunggu proses upload selesai — Netlify otomatis kasih link seperti `namaacak-123.netlify.app`
5. (Opsional) klik **Site settings → Change site name** untuk ganti jadi nama yang lebih mudah diingat, misal `infinix-5cabang.netlify.app`

Selesai — website 5 toko sudah online. Update produk/harga/stok cukup edit spreadsheet, tidak perlu upload ulang ke Netlify.

---

## Tips update rutin

- **Tambah produk baru** → tambah 1 baris di tab `Produk`, lalu tambah baris stoknya per toko di tab `Stok`
- **Update harga** → edit kolom `Harga` di tab `Produk`, otomatis kepakai di semua toko
- **Update stok harian** → edit kolom `Stok` di tab `Stok`, per baris per toko
- Perubahan di sheet muncul di web **dalam beberapa detik** setelah pengunjung refresh halaman — tidak perlu setting apa pun lagi

---

## Foto produk di bagian hero (banner hitam atas)

Tiap halaman toko sudah punya slot foto produk di sisi kanan banner hitam. Selama file foto belum ada, otomatis muncul tulisan placeholder di situ — halaman tetap tampil rapi, tidak rusak.

Untuk menampilkan foto produk (misal Infinix Smart 20):
1. Siapkan foto produk (PNG/JPG, sebaiknya latar transparan atau polos, ukuran persegi/landscape)
2. Beri nama file persis: `hero-product.jpg`
3. Taruh di dalam folder `assets/` toko tersebut (sejajar dengan `style.css` dan `app.js`)
4. Upload ulang folder ke Netlify (drag folder yang sama ke site yang sudah ada untuk update)

Tiap toko punya folder `assets/` sendiri-sendiri, jadi foto produk hero bisa beda-beda per toko kalau mau (atau pakai foto yang sama untuk semua, tinggal copy file yang sama ke tiap folder `assets/`).

---

## Foto produk hero auto-slide (update terbaru)

Kolom foto di hero sekarang **transparan** (menyatu dengan background gelap, tanpa kotak/border) dan bisa **auto-slide** kalau ada lebih dari 1 foto.

Cara pakai:
1. Simpan foto produk dengan nama **berurutan**: `hero-product-1.png`, `hero-product-2.png`, `hero-product-3.png`, dst.
2. Taruh semua di folder `assets/` toko tersebut
3. Upload ulang folder ke Netlify

Aturan otomatis:
- Cuma ada 1 foto (`hero-product-1.png` saja) → tampil statis, tidak slide
- Ada 2 foto atau lebih → otomatis fade bergantian tiap 4 detik, urut sesuai nomor filename
- Tidak ada foto sama sekali → tetap muncul teks placeholder, halaman tidak rusak
- Tidak perlu edit kode apa pun — tinggal tambah/ganti/hapus file gambarnya saja
