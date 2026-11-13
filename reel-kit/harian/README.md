# Cetakan Reel seri harian (gaya @negara.gabut) — dipakai pertama di Reel DAY 4 (13 Nov 2026)
1. VO Vilindo: AI Studio → generate-speech → Create new dialog → Speaker: Mako → Style: "Young Jakarta Gen-Z guy, casual Indonesian slang, deadpan and dry comedic delivery..." → satu blok teks, kalimat dipisah " ... " → Run → Download.
2. Potong waktu kalimat: ffmpeg silencedetect (n=-38dB d=0.3) → isi waktu di data.js (SUB, P.K kartu komen, P.ST kartu distrik).
3. Mulut Vilindo: amplop VO 30fps → data/talk_<shot>.json (irisan per shot). Shot d4-* di kota_shot.js (lahan proyek site_patch.js: __SITE {x,z,r,lampu,alat,crane}; Vilindo bebas posisi: vilp + talk).
4. Render klip: node kota_shot.js <shot> <detik> out.mp4 (paralel -P 2). Gabung → bg/%05d.jpg 1080x1920 30fps.
5. Overlay: node render.js (r.html: judul kuning DAY X, badge, subtitle kata kunci kuning, kartu komen putih, kartu distrik %, kartu LIVE TAHAP, CTA + PART SELANJUTNYA).
6. Audio: musik.py <dur> mus.wav ceria + VO (offset .15s) + SFX pop/whoosh/thud/ding, musik di-mute saat momen lucu; ffmpeg x264 veryfast crf19.
