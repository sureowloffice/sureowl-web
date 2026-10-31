# Panduan: online-kan website SureOwl

Website ini sudah lengkap: daftar paket, ala carte, keranjang, form data lagu, dan pembayaran online lewat **Mayar** (QRIS, Virtual Account bank, e-wallet). Ada 3 langkah, sekali saja.

---

## 1. Buat akun Mayar (penerima pembayaran)

1. Daftar di **https://mayar.id** (paket Starter gratis).
2. Lakukan verifikasi sebagai **Individu**: siapkan KTP, foto selfie memegang KTP, dan foto buku tabungan atau screenshot rekening (nama dan nomor rekening). NPWP opsional.
3. Setelah akun aktif, buka **https://web.mayar.id/api-keys**, lalu buat API key dengan akses **Read & Write**.
4. Simpan API key itu baik-baik. **Jangan dibagikan ke siapa pun, termasuk lewat chat.**

Biaya Mayar (dipotong dari pembayaran yang masuk, paket Starter): 1,5% biaya platform untuk invoice, ditambah biaya metode bayar, yaitu QRIS 0,7%, Virtual Account Rp4.000, dan e-wallet 1,5–2%. Cek angka terbarunya di mayar.id/pricing.

> Mau uji coba dulu tanpa uang sungguhan? Buat juga akun di **https://web.mayar.io** (sandbox), ambil API key di sana, dan isi `MAYAR_ENV` = `sandbox` di langkah 3.

## 2. Upload website ke Vercel

1. Daftar gratis di **https://vercel.com** (paling mudah lewat akun GitHub atau email).
2. Cara termudah adalah lewat GitHub:
   - Buat repository baru di github.com, misalnya `sureowl-web`.
   - Klik **Add file → Upload files**, lalu seret semua isi folder `website` ini (index.html, terima-kasih.html, catalog.json, package.json, dan folder `api`), kemudian klik **Commit**.
   - Di Vercel, klik **Add New → Project**, pilih repository `sureowl-web`, lalu klik **Deploy**.
3. Beri nama project **sureowl**, supaya alamatnya menjadi **sureowl.vercel.app** (kalau nama itu masih tersedia).

## 3. Aktifkan pembayaran

Di Vercel, buka project, lalu **Settings → Environment Variables**, dan tambahkan:

| Name | Value |
|---|---|
| `MAYAR_API_KEY` | API key dari langkah 1 |
| `MAYAR_ENV` | `production` (atau `sandbox` untuk uji coba) |
| `SITE_URL` | `https://sureowl.vercel.app` |

Setelah itu, buka tab **Deployments**, klik titik tiga di deployment teratas, lalu pilih **Redeploy**.

Selesai. Coba pesan satu paket di website, dan kamu akan diarahkan ke halaman bayar Mayar.

---

## Setelah ada pesanan masuk

- Notifikasi pembayaran dan data pembeli (nama, email, WA, judul lagu, link lagu, tanggal rilis, catatan) muncul di dashboard Mayar dan email kamu.
- Setiap pesanan punya nomor seperti `SO-ABC123`. Nomor yang sama terlihat oleh pembeli di halaman terima kasih.
- Selama `MAYAR_API_KEY` belum diisi, website tetap jalan, dan pembeli diarahkan untuk order lewat WhatsApp.

## Mengubah harga atau menambah paket

Semua harga ada di **satu file**, yaitu `catalog.json`. Ubah angkanya, upload ulang ke GitHub, dan Vercel akan memperbarui website otomatis. Harga di halaman dan harga tagihan selalu ikut file ini, jadi pembeli tidak bisa mengubah harga dari browser.

## Pakai domain sendiri nanti

Kalau sudah membeli sureowl.id: buka Vercel, lalu **Settings → Domains → Add**, ketik domainnya, dan ikuti petunjuk DNS. Setelah itu ganti `SITE_URL` ke domain baru, lalu Redeploy.
