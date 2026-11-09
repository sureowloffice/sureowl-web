# Cetakan Reel Kota Seni

Satu perintah per reel. Videonya diambil dari kode web asli (kota 3D yang sama dengan kotaseni.vercel.app),
lalu teks, kartu, musik orisinal, dan VO ditempel otomatis sesuai seri harinya.

## Seri mingguan
| Hari | Perintah | Data yang dipakai |
|---|---|---|
| Senin | `senin` | Lomba Kawasan (ambil **Minggu malam** biar jadi hasil akhir) |
| Selasa | `selasa` | warga.json, warga baru 7 hari terakhir |
| Rabu | `rabu` | Voting Gedung (opsi, suara sementara) |
| Kamis | `kamis` | `data/isi.json` → `karya` (kalau kosong: reel ajakan kirim karya) |
| Jumat | `jumat` | jumlah warga; hook ganti otomatis tiap minggu |
| Sabtu pagi | `sabtu` | jadwal festival |
| Sabtu malam | `sabtu-rekap` | jumlah & daftar yang hadir (ambil setelah 21.00) |
| Minggu | `minggu` | pemenang voting + rekap festival |

## Alur (yang dikerjakan Claude)
1. `git pull` repo `sureowl-web` (warga.json terbaru).
2. Ambil data live lewat browser: buka `kotaseni.vercel.app/api/akun?a=prof`, jalankan
   fetch `prof, lomba, vote, fest, tidur` → simpan ke `data/live.json` (tambahkan `"_diambil"`).
3. `node buat_reel.js <seri> --naskah` → naskah VO di `out/<tgl>_<seri>/naskah_vo.txt`.
4. (Opsional) User rekam VO di Google AI Studio (suara Mako, jeda ±1 dtk antar baris), taruh `vo.wav` di folder out.
   Tanpa VO juga jadi (musik + teks).
5. `node buat_reel.js <seri> [--vo file.wav]` → hasilnya:
   - `KotaSeni_<tgl>_<seri>.mp4` (1080×1920, 30 fps)
   - `Cover_<tgl>_<seri>.png`
   - `cek.png` (1 frame per adegan, buat ngecek cepat, bukan preview berulang)
   - `caption.txt`
6. Salin hasil ke Mac: Desktop/SureOwl/Viralindong/Reel/.

## Ganti isi
- Teks/adegan tiap seri: `seri/<hari>.js` (tiap adegan: `shot`, `dur`, `pill`, `atas` (pakai `*kata*` buat warna emas), `besar`, `kartu`, `bawah`, `vo`, `cta`).
- Kartu: `klasemen`, `voting`, `daftar`, `angka`, `hitung`, `langkah`, `chips`.
- Shot kamera: `overview orbit kampung panggung festival bandara gedungmusik kantor halte lahan`,
  `kawasan-<k>` dan `gerbang-<k>` (k = musik visual film cerita pusat kriya). Lihat `kota_shot.js`.
- Musik: `gaya` = `ceria` | `megah` | `santai` (disintesis, bebas hak cipta).

Render ±0,5 dtk per frame kota (2 shot paralel) → reel 20 dtk ≈ 6–8 menit.
