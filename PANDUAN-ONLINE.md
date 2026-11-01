# Panduan: online-kan website Viralindong

Saat ini website memakai **mode WhatsApp**:
pembeli memilih paket atau ala carte, mengisi data lagu, lalu menekan **Kirim pesanan via WhatsApp**. WhatsApp akan terbuka ke nomor Viralindong (0813 1199 5520) dengan pesan yang sudah terisi otomatis: nomor pesanan, daftar item, total, nama, kontak, judul lagu, link, dan tanggal rilis. Setelah itu admin membalas dengan detail pembayaran (transfer bank atau QRIS).

Mode ini tidak butuh akun pembayaran apa pun. Cukup upload website-nya.

---

## Upload website ke Vercel (gratis)

1. Daftar di **https://vercel.com**. Paling mudah lewat akun GitHub.
2. Buat repository baru di **github.com**, beri nama `sureowl-web`.
3. Di repository itu, klik **Add file → Upload files**, lalu seret **semua isi** folder `website` (index.html, terima-kasih.html, catalog.json, package.json, dan folder `api`). Klik **Commit changes**.
4. Di Vercel, klik **Add New → Project**, pilih `sureowl-web`, lalu klik **Deploy**.
5. Beri nama project **viralindong**, supaya alamatnya menjadi **viralindong.vercel.app**.

Selesai. Setelah itu, pasang alamat **viralindong.vercel.app** di bio Instagram @viralindong.

## Mengubah harga, paket, atau nomor WhatsApp

Semua ada di **satu file**, yaitu `catalog.json`:
- `"whatsapp"`: nomor tujuan order, ditulis dengan format 62, misalnya `6281311995520`
- `"price"`: harga jual, `"normal"`: harga coret
- `"includes"`: isi paket

Ubah file itu di GitHub (klik file, lalu ikon pensil, lalu Commit), dan Vercel akan memperbarui website otomatis dalam sekitar 1 menit.

## Saat badan usaha sudah siap: pembayaran otomatis

Website ini sudah disiapkan untuk pembayaran online (folder `api`). Kalau nanti mau mengaktifkannya:
1. Siapkan akun payment gateway (saat ini kodenya untuk Mayar, dan bisa diganti ke Xendit atau Midtrans).
2. Di Vercel, buka **Settings → Environment Variables**, lalu isi `MAYAR_API_KEY`.
3. Di `catalog.json`, ganti `"paymentMode": "whatsapp"` menjadi `"paymentMode": "mayar"`.

## Pakai domain sendiri nanti

Kalau sudah membeli sureowl.id: buka Vercel, lalu **Settings → Domains → Add**, ketik domainnya, dan ikuti petunjuk DNS dari Vercel.
