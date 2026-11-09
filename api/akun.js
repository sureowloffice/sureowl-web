// Kota Seni — Akun warga: masuk, Koin Nada, EXP/level, absen beruntun, misi harian, papan teraktif, verifikasi KTW via DM
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN = process.env.ADMIN_KEY || '';

// misi harian: hadiah koin (EXP = koin yang didapat)
const MISI = {
  absen: { koin: 10, ket: 'Absen harian' },
  chat: { koin: 5, ket: 'Ngobrol di Pesan Warga', cek: 'chat' },
  radio: { koin: 5, ket: 'Dengerin Radio Kota' },
  koran: { koin: 3, ket: 'Baca Harian Kota Seni' },
  kartu: { koin: 3, ket: 'Buka Kartu Warga-mu' },
  ajak: { koin: 5, ket: 'Ajak teman pindah' },
  voting: { koin: 3, ket: 'Lihat voting gedung' }
};

async function redis(cmds) {
  const r = await fetch(URL_ + '/pipeline', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).map(x => x.result);
}

let wargaCache = { at: 0, set: null };
let onlineCache = { at: 0, body: null };
async function warga(host) {
  if (wargaCache.set && Date.now() - wargaCache.at < 60000) return wargaCache.set;
  const r = await fetch('https://' + host + '/warga.json?nc=' + Date.now());
  const d = await r.json();
  wargaCache = { at: Date.now(), set: new Set(d.warga.map(w => String(w.u).toLowerCase())), list: d.warga };
  return wargaCache.set;
}

const today = () => new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() + 7 * 36e5 - 864e5).toISOString().slice(0, 10);
// Lomba Kawasan: minggu dihitung Senin 00.00 – Minggu 23.59 WIB
const wkStart = (ms = Date.now()) => { const d = new Date(ms + 7 * 36e5); const dow = (d.getUTCDay() + 6) % 7; return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow) - 7 * 36e5 };
const wkId = (ms = Date.now()) => new Date(wkStart(ms) + 7 * 36e5).toISOString().slice(0, 10);
const LOMBA_MULAI = '2026-11-09'; // minggu pertama Lomba Kawasan
const LP = { absen: 5, misi: 1, karya: 15, baru: 10 };
const lpCmd = (u, n, ms) => [['HINCRBY', 'lp:' + wkId(ms), u, String(n)], ['EXPIRE', 'lp:' + wkId(ms), '3024000']];
const KAWS = ['musik', 'visual', 'film', 'cerita', 'kriya', 'pusat'];
let lombaCache = { at: 0, body: null };
async function lombaWeek(ws, list, prof) {
  const we = ws + 7 * 864e5, id = wkId(ws);
  const [rows] = await redis([['HGETALL', 'lp:' + id]]);
  const pts = {};
  if (Array.isArray(rows)) for (let i = 0; i < rows.length; i += 2) pts[rows[i]] = +rows[i + 1] || 0;
  else if (rows && typeof rows === 'object') for (const k in rows) pts[k] = +rows[k] || 0;
  const K = {}; for (const k of KAWS) K[k] = { k, poin: 0, aktif: 0, baru: 0, top: [] };
  const kawOf = u => { const v = prof[u]; const pk = v ? String(v).split(':')[0] : 'pusat'; return K[pk] ? pk : 'pusat' };
  for (const w of list) { // warga baru minggu ini yang sudah memilih kawasan
    const u = String(w.u).toLowerCase(); if (!prof[u]) continue;
    const t = Date.parse(String(w.t || '') + 'T' + (w.j || '12:00') + ':00+07:00');
    if (t >= ws && t < we) { const k = kawOf(u); K[k].baru++; K[k].poin += LP.baru; pts[u] = (pts[u] || 0) }
  }
  for (const u in pts) { if (!pts[u]) continue; const k = kawOf(u); K[k].aktif++; K[k].poin += pts[u]; K[k].top.push({ u, p: pts[u] }) }
  const out = KAWS.map(k => { const c = K[k]; c.top = c.top.sort((a, b) => b.p - a.p).slice(0, 3); return c }).sort((a, b) => b.poin - a.poin || b.aktif - a.aktif);
  return out;
}
const level = exp => Math.floor(Math.sqrt((exp || 0) / 25)) + 1;
const hashKey = k => crypto.createHash('sha256').update(k).digest('hex').slice(0, 32);

// kebutuhan avatar: turun pelan tiap jam (juga saat offline)
const NEED_DECAY = { l: 5, e: 2, b: 4, m: 3, i: 2 };
const AKSI = { roti: { koin: 15, l: 25 }, nasi: { koin: 30, l: 50 }, kopi: { koin: 12, e: 15 }, esteh: { koin: 8, l: 8, m: 5 }, tidur: {}, bangun: {}, mandi: { b: 50, cd: 10 }, nongkrong: { m: 12, cd: 10 }, dengar: { i: 18, m: 4, cd: 15 } };
// tidur = sesi panjang: energi naik pelan selama tidur, bangun otomatis kalau energi penuh
const SLEEP_RATE = 60; // energi per jam (±1 per menit)
// profesi warga dipilih sendiri saat masuk kota (bukan dari komentar IG)
const PROF = {
  musik: ['gitaris', 'vokalis', 'drummer', 'bassist', 'keyboard', 'komposer', 'penulis', 'produser', 'dj', 'tiup', 'sound'],
  visual: ['pelukis', 'digital', 'komik', 'karakter', 'fotografer', 'desainer', 'tattoo', 'mural'],
  film: ['filmmaker', 'videografer', 'editor', 'animator', 'gim', 'interaktif', 'sculpt3d', 'kreator'],
  cerita: ['penari', 'teater', 'sastra', 'puisi', 'story'],
  kriya: ['keramik', 'kayu', 'batu', 'patung', 'anyaman', 'batik', 'tekstil', 'fesyen', 'kriya'],
  pusat: ['penikmat', 'warga', 'pengelola', 'komunitas', 'tarot']
};
function needNow(raw) {
  let n = null; try { n = raw ? JSON.parse(raw) : null } catch (e) { n = null }
  const now = Date.now(); if (!n) n = { l: 80, e: 80, b: 80, m: 70, i: 50, t: now, kc: 0, cd: {} };
  const h = Math.max(0, (now - (n.t || now)) / 36e5);
  for (const k in NEED_DECAY) {
    if (k === 'e' && n.zz) continue;
    n[k] = Math.max(0, Math.min(100, (n[k] == null ? 80 : n[k]) - NEED_DECAY[k] * h * (n.zz && k !== 'l' ? 0.4 : 1)));
  }
  if (n.zz) { n.e = Math.min(100, (n.e == null ? 80 : n.e) + SLEEP_RATE * h); if (n.e >= 100) { n.zz = null; n.woke = now } }
  n.t = now; n.cd = n.cd || {}; return n;
}
const r1 = x => Math.round(x * 10) / 10;
function needOut(n, koin) {
  return { lapar: r1(n.l), energi: r1(n.e), bersih: r1(n.b), mood: r1(n.m), inspirasi: r1(n.i), lemas: ['l', 'e', 'b', 'm', 'i'].some(k => n[k] <= 0), kerja: n.kc || 0, karier: Math.min(5, Math.floor((n.kc || 0) / 10)), koin, cd: n.cd, now: Date.now(), tidur: n.zz || null, rate: SLEEP_RATE };
}


// ---- Karya warga untuk Layar Raksasa Alun-alun (wajib disetujui admin dulu) ----
const KARYA_JENIS = { gambar: 'Gambar', foto: 'Foto', lagu: 'Lagu', video: 'Video' };
const LINK_OK = ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com', 'instagram.com', 'tiktok.com', 'music.apple.com', 'drive.google.com'];
function cleanLink(s) {
  s = String(s || '').trim(); if (!s) return '';
  try { const x = new URL(s); if (x.protocol !== 'https:') return null; const h = x.hostname.replace(/^www\./, '').replace(/^m\./, ''); if (!LINK_OK.some(d => h === d || h.endsWith('.' + d))) return null; return x.toString().slice(0, 300) } catch (e) { return null }
}
async function karyaMetas(ids) {
  if (!ids || !ids.length) return [];
  const [vals] = await redis([['MGET', ...ids.map(id => 'karya:' + id)]]);
  return (vals || []).map(v => { try { return v ? JSON.parse(v) : null } catch (e) { return null } }).filter(Boolean);
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function profil(u) {
  const d = today();
  const [koin, exp, streak, last, done, ver, chatc, pr] = await redis([
    ['GET', 'koin:' + u], ['GET', 'exp:' + u], ['GET', 'streak:' + u], ['GET', 'absen:' + u],
    ['SMEMBERS', 'misi:' + u + ':' + d], ['GET', 'ver:' + u], ['GET', 'chatc:' + u + ':' + d], ['HGET', 'prof', u]
  ]);
  const e = +exp || 0, lv = level(e);
  return {
    u, koin: +koin || 0, exp: e, level: lv, nextExp: 25 * lv * lv, prevExp: 25 * (lv - 1) * (lv - 1),
    streak: last === d || last === yesterday() ? (+streak || 0) : 0, absenHariIni: last === d,
    misi: done || [], verified: !!ver, chatHariIni: +chatc || 0, tanggal: d, prof: pr || null
  };
}

module.exports = async (req, res) => {
  if (!URL_ || !TOKEN) return send(res, 503, { error: 'Akun kota belum aktif.' });
  try {
    if (req.method === 'GET') {
      const q = new URL(req.url, 'http://x').searchParams;
      if (q.get('a') === 'top') {
        const [rows] = await redis([['ZREVRANGE', 'papan:exp', '0', '9', 'WITHSCORES']]);
        const top = [];
        for (let i = 0; i < (rows || []).length; i += 2) top.push({ u: rows[i], exp: +rows[i + 1], level: level(+rows[i + 1]) });
        res.setHeader('Cache-Control', 'public, max-age=30');
        return send(res, 200, { top });
      }
      if (q.get('a') === 'online') { // warga yang sedang main (posisi terakhir < 30 detik)
        if (onlineCache.at && Date.now() - onlineCache.at < 3000) return send(res, 200, onlineCache.body);
        const now = Date.now();
        const [, us] = await redis([['ZREMRANGEBYSCORE', 'online', '-inf', String(now - 60000)], ['ZRANGEBYSCORE', 'online', String(now - 30000), '+inf']]);
        let list = [];
        if (us && us.length) {
          const [vals] = await redis([['MGET', ...us.slice(0, 60).map(u => 'pos:' + u)]]);
          list = (vals || []).map((v, i) => { try { return v ? Object.assign({ u: us[i] }, JSON.parse(v)) : null } catch (e) { return null } }).filter(Boolean);
        }
        const body = { online: list, n: list.length };
        onlineCache = { at: Date.now(), body };
        return send(res, 200, body);
      }
      if (q.get('a') === 'rumah') { // dekorasi rumah warga (publik, hanya baca)
        const ru = String(q.get('u') || '').toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 40);
        if (!ru) return send(res, 400, { error: 'Username tidak valid.' });
        const [v] = await redis([['GET', 'rumah:' + ru]]);
        res.setHeader('Cache-Control', 'public, max-age=10');
        let deco = null; try { deco = v ? JSON.parse(v) : null } catch (e) { deco = null }
        return send(res, 200, { deco });
      }
      if (q.get('a') === 'prof') { // profesi pilihan warga (publik): { u: 'musik:gitaris' }
        const [rows] = await redis([['HGETALL', 'prof']]);
        const map = {};
        if (Array.isArray(rows)) for (let i = 0; i < rows.length; i += 2) map[rows[i]] = rows[i + 1];
        else if (rows && typeof rows === 'object') Object.assign(map, rows);
        res.setHeader('Cache-Control', 'public, max-age=20');
        return send(res, 200, { prof: map });
      }
      if (q.get('a') === 'tidur') { // warga yang sedang tidur di rumahnya
        const now = Date.now();
        const [, us] = await redis([['ZREMRANGEBYSCORE', 'tidur', '-inf', String(now)], ['ZRANGEBYSCORE', 'tidur', String(now), '+inf']]);
        res.setHeader('Cache-Control', 'public, max-age=15');
        return send(res, 200, { tidur: us || [] });
      }
      if (q.get('a') === 'lomba') { // klasemen Lomba Kawasan minggu ini + juara minggu lalu
        res.setHeader('Cache-Control', 'public, max-age=30');
        if (lombaCache.body && Date.now() - lombaCache.at < 45000) return send(res, 200, lombaCache.body);
        const host = req.headers['x-forwarded-host'] || req.headers.host || 'kotaseni.vercel.app';
        await warga(host);
        const [prow] = await redis([['HGETALL', 'prof']]);
        const prof = {};
        if (Array.isArray(prow)) for (let i = 0; i < prow.length; i += 2) prof[prow[i]] = prow[i + 1];
        else if (prow && typeof prow === 'object') Object.assign(prof, prow);
        const ws = wkStart(), list = wargaCache.list || [];
        const kini = await lombaWeek(ws, list, prof), lalu = await lombaWeek(ws - 7 * 864e5, list, prof);
        const body = { wk: wkId(), mulai: ws, akhir: ws + 7 * 864e5, poin: LP, kawasan: kini, juaraLalu: wkId(ws - 7 * 864e5) >= LOMBA_MULAI && lalu[0] && lalu[0].poin > 0 ? { k: lalu[0].k, poin: lalu[0].poin } : null };
        lombaCache = { at: Date.now(), body };
        return send(res, 200, body);
      }
      if (q.get('a') === 'karya') { // daftar karya yang sudah disetujui (publik)
        const [ids] = await redis([['LRANGE', 'karya:ok', '0', '39']]);
        const list = (await karyaMetas(ids)).map(k => ({ id: k.id, u: k.u, jenis: k.jenis, judul: k.judul, link: k.link || '', t: k.t, ok: k.ok }));
        res.setHeader('Cache-Control', 'public, max-age=30');
        return send(res, 200, { karya: list });
      }
      if (q.get('a') === 'karyaImg') { // gambar karya yang sudah disetujui
        const id = String(q.get('id') || '').replace(/[^a-z0-9]/g, '').slice(0, 24);
        const [m, img] = await redis([['GET', 'karya:' + id], ['GET', 'karyaimg:' + id]]);
        let meta = null; try { meta = m ? JSON.parse(m) : null } catch (e) { meta = null }
        if (!meta || meta.st !== 'ok' || !img) { res.statusCode = 404; return res.end() }
        res.statusCode = 200; res.setHeader('Content-Type', 'image/jpeg'); res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
        return res.end(Buffer.from(img, 'base64'));
      }
      return send(res, 400, { error: 'Permintaan tidak dikenal.' });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Metode tidak didukung.' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch (e) { body = {} } }
    body = body || {};
    const a = String(body.a || '');
    const u = String(body.u || '').trim().replace(/^@/, '').toLowerCase().slice(0, 40);
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'kotaseni.vercel.app';

    // ---- admin: verifikasi kode dari DM (dipanggil tugas pengecekan) ----
    if (a === 'verify') {
      if (!ADMIN || body.admin !== ADMIN) return send(res, 403, { error: 'Tidak diizinkan.' });
      const code = String(body.kode || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const dmFrom = String(body.dari || '').toLowerCase().replace(/^@/, '');
      const [rec] = await redis([['GET', 'kode:' + code]]);
      if (!rec) return send(res, 404, { error: 'Kode tidak ditemukan / kedaluwarsa.' });
      const [ku, kh] = rec.split('|');
      if (dmFrom && dmFrom !== ku) return send(res, 409, { error: 'Pengirim DM bukan pemilik username.', u: ku });
      await redis([['SET', 'ver:' + ku, '1'], ['SET', 'claim:' + ku, kh], ['DEL', 'kode:' + code], ['INCRBY', 'koin:' + ku, '50'], ['INCRBY', 'exp:' + ku, '50'], ['ZINCRBY', 'papan:exp', '50', ku]]);
      return send(res, 200, { ok: true, u: ku });
    }

    if (a === 'karyaAdmin') { // moderasi karya: hanya pemegang ADMIN_KEY
      if (!ADMIN || body.admin !== ADMIN) return send(res, 403, { error: 'Kunci admin salah.' });
      const op = String(body.op || 'list'), id = String(body.id || '').replace(/[^a-z0-9]/g, '').slice(0, 24);
      if (op === 'count') { const [n] = await redis([['LLEN', 'karya:pending']]); return send(res, 200, { pending: +n || 0 }) }
      if (op === 'list') {
        const [pid, oid] = await redis([['LRANGE', 'karya:pending', '0', '29'], ['LRANGE', 'karya:ok', '0', '39']]);
        const pend = await karyaMetas(pid);
        let imgs = [];
        if (pend.length) { const [v] = await redis([['MGET', ...pend.map(k => 'karyaimg:' + k.id)]]); imgs = v || [] }
        return send(res, 200, { pending: pend.map((k, i) => Object.assign({}, k, { img: imgs[i] ? 'data:image/jpeg;base64,' + imgs[i] : '' })), ok: await karyaMetas(oid) });
      }
      const [m] = await redis([['GET', 'karya:' + id]]);
      let meta = null; try { meta = m ? JSON.parse(m) : null } catch (e) { meta = null }
      if (!meta) return send(res, 404, { error: 'Karya tidak ditemukan.' });
      if (op === 'ok') {
        if (meta.st === 'ok') return send(res, 200, { ok: true });
        meta.st = 'ok'; meta.ok = Date.now();
        await redis([['SET', 'karya:' + id, JSON.stringify(meta)], ['LREM', 'karya:pending', '0', id], ['LPUSH', 'karya:ok', id], ['LTRIM', 'karya:ok', '0', '39'],
          ['INCRBY', 'koin:' + meta.u, '100'], ['INCRBY', 'exp:' + meta.u, '100'], ['ZINCRBY', 'papan:exp', '100', meta.u], ...lpCmd(meta.u, LP.karya)]);
        return send(res, 200, { ok: true });
      }
      if (op === 'tolak' || op === 'hapus') {
        await redis([['LREM', 'karya:pending', '0', id], ['LREM', 'karya:ok', '0', id], ['DEL', 'karya:' + id], ['DEL', 'karyaimg:' + id]]);
        return send(res, 200, { ok: true });
      }
      return send(res, 400, { error: 'Operasi tidak dikenal.' });
    }

    const key = String(body.k || '');
    if (!u || !/^[a-z0-9._]+$/.test(u)) return send(res, 400, { error: 'Username tidak valid.' });
    if (key.length < 16 || key.length > 80) return send(res, 400, { error: 'Sesi tidak valid, muat ulang halaman.' });
    const set = await warga(host);
    if (!set.has(u)) return send(res, 403, { error: 'Username ini belum jadi warga. Follow @viralindongid dulu, nanti namamu masuk kota paling lama 1 jam.' });
    const kh = hashKey(key);

    // klaim perangkat (sama dengan chat): perangkat pertama memegang username, KTW bisa memindahkan
    const [, claim, banned] = await redis([['SET', 'claim:' + u, kh, 'NX'], ['GET', 'claim:' + u], ['SISMEMBER', 'banned', u]]);
    if (banned) return send(res, 403, { error: 'Akun ini sedang dibatasi oleh Wali Kota.' });
    const mine = claim === kh;

    if (a === 'kode') { // minta kode KTW untuk dikirim lewat DM
      const [old] = await redis([['GET', 'kodeu:' + u + ':' + kh]]);
      if (old) return send(res, 200, { kode: old });
      const code = 'KTW' + crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
      await redis([['SET', 'kode:' + code, u + '|' + kh, 'EX', '172800'], ['SET', 'kodeu:' + u + ':' + kh, code, 'EX', '172800']]);
      return send(res, 200, { kode: code });
    }
    if (!mine) return send(res, 403, { error: 'Username ini sudah dipakai di perangkat lain. Kalau ini akunmu, ambil KTW: kirim kode verifikasi lewat DM ke @viralindongid.', perluKTW: true });

    if (a === 'masuk' || a === 'profil') return send(res, 200, { ok: true, profil: await profil(u) });

    if (a === 'prof') { // pilih / ganti profesi: kategori + bidang
      const pk = String(body.pk || ''), ps = String(body.ps || '');
      if (!PROF[pk] || !PROF[pk].includes(ps)) return send(res, 400, { error: 'Pilih profesi dan bidangnya dulu.' });
      const [old, ch] = await redis([['HGET', 'prof', u], ['GET', 'profch:' + u]]);
      if (old === pk + ':' + ps) return send(res, 200, { ok: true, prof: old });
      if (old && ch) return send(res, 429, { error: 'Profesi baru bisa diganti lagi besok ya.' });
      const cmds = [['HSET', 'prof', u, pk + ':' + ps]];
      if (old) cmds.push(['SET', 'profch:' + u, '1', 'EX', '86400']);
      await redis(cmds);
      return send(res, 200, { ok: true, prof: pk + ':' + ps });
    }

    if (a === 'karya') { // kirim karya ke Layar Raksasa: masuk antrean, tampil setelah disetujui
      const jenis = KARYA_JENIS[body.jenis] ? body.jenis : null;
      const judul = String(body.judul || '').replace(/[<>]/g, '').trim().slice(0, 60);
      const link = cleanLink(body.link);
      const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(String(body.img || ''));
      if (!jenis) return send(res, 400, { error: 'Pilih jenis karya.' });
      if (judul.length < 2) return send(res, 400, { error: 'Isi judul karyamu.' });
      if (link === null) return send(res, 400, { error: 'Link harus dari YouTube, Spotify, SoundCloud, Instagram, TikTok, Apple Music atau Google Drive.' });
      if ((jenis === 'lagu' || jenis === 'video') && !link) return send(res, 400, { error: 'Untuk lagu atau video, tambahkan link-nya.' });
      if (!m) return send(res, 400, { error: 'Tambahkan gambar karya (atau cover/thumbnail).' });
      if (m[1].length > 600000) return send(res, 413, { error: 'Gambar terlalu besar.' });
      if (!body.setuju) return send(res, 400, { error: 'Centang dulu pernyataan karya milikmu sendiri.' });
      const [rl, npend] = await redis([['SET', 'rlkarya:' + u, '1', 'NX', 'EX', '21600'], ['LLEN', 'karya:pending']]);
      if (!rl) return send(res, 429, { error: 'Satu karya tiap 6 jam ya. Coba lagi nanti.' });
      if (+npend >= 60) return send(res, 429, { error: 'Antrean karya lagi penuh. Coba lagi besok.' });
      const id = Date.now().toString(36) + crypto.randomBytes(3).toString('hex');
      const meta = { id, u, jenis, judul, link: link || '', t: Date.now(), st: 'pending' };
      await redis([['SET', 'karya:' + id, JSON.stringify(meta)], ['SET', 'karyaimg:' + id, m[1]], ['LPUSH', 'karya:pending', id]]);
      return send(res, 200, { ok: true, id });
    }

    if (a === 'pos') { // posisi karakter saat mode main
      const num = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round((+v || 0) * 100) / 100));
      const p = { x: num(body.x, -60, 60), z: num(body.z, -400, 46), yaw: num(body.yaw, -50, 50), emo: ['wave', 'dance', 'music'].includes(body.emo) ? body.emo : '' };
      const [ok] = await redis([['SET', 'rlp:' + u, '1', 'NX', 'PX', '1800']]);
      if (!ok) return send(res, 200, { ok: true, skip: true });
      await redis([['SET', 'pos:' + u, JSON.stringify(p), 'EX', '40'], ['ZADD', 'online', String(Date.now()), u]]);
      return send(res, 200, { ok: true });
    }
    if (a === 'rumah') { // simpan dekorasi rumah sendiri
      const d = body.deco || {};
      const ITEMS = ['🛋️','🛏️','🪑','📺','🪴','💡','📚','🖼️','🎸','🥁','🎹','🎤','🎧','🎨','🎥','🔮','🧸','🏆','🪩','🐱','☕','🕯️'];
      const it = (Array.isArray(d.it) ? d.it : []).slice(0, 40).filter(a => Array.isArray(a) && Number.isInteger(a[0]) && Number.isInteger(a[1]) && a[0] >= 0 && a[0] < 6 && a[1] >= 0 && a[1] < 6 && ITEMS.includes(a[2])).map(a => [a[0], a[1], a[2]]);
      const deco = { f: Math.max(0, Math.min(5, d.f | 0)), w: Math.max(0, Math.min(5, d.w | 0)), it };
      const [rl] = await redis([['SET', 'rlr:' + u, '1', 'NX', 'PX', '3000']]);
      if (!rl) return send(res, 429, { error: 'Tunggu sebentar sebelum simpan lagi.' });
      await redis([['SET', 'rumah:' + u, JSON.stringify(deco)]]);
      return send(res, 200, { ok: true, deco });
    }
    if (a === 'keluar') { await redis([['ZREM', 'online', u], ['DEL', 'pos:' + u]]); return send(res, 200, { ok: true }) }

    if (a === 'misi') {
      const id = String(body.id || '');
      const m = MISI[id];
      if (!m) return send(res, 400, { error: 'Misi tidak dikenal.' });
      const d = today();
      const [rl] = await redis([['SET', 'rla:' + u, '1', 'NX', 'PX', '1500']]);
      if (!rl) return send(res, 429, { error: 'Pelan-pelan ya.' });
      if (m.cek === 'chat') {
        const [c] = await redis([['GET', 'chatc:' + u + ':' + d]]);
        if (!(+c > 0)) return send(res, 400, { error: 'Kirim 1 pesan di Pesan Warga dulu.' });
      }
      const [added] = await redis([['SADD', 'misi:' + u + ':' + d, id], ['EXPIRE', 'misi:' + u + ':' + d, '172800']]);
      if (!added) return send(res, 200, { ok: true, sudah: true, profil: await profil(u) });
      let koin = m.koin, bonus = 0;
      if (id === 'absen') {
        const [last, st] = await redis([['GET', 'absen:' + u], ['GET', 'streak:' + u]]);
        const s = last === yesterday() ? (+st || 0) + 1 : 1;
        bonus = Math.min(s - 1, 7) * 2;
        await redis([['SET', 'absen:' + u, d], ['SET', 'streak:' + u, String(s)]]);
      }
      koin += bonus;
      await redis([['INCRBY', 'koin:' + u, String(koin)], ['INCRBY', 'exp:' + u, String(koin)], ['ZINCRBY', 'papan:exp', String(koin), u], ...lpCmd(u, id === 'absen' ? LP.absen : LP.misi)]);
      return send(res, 200, { ok: true, dapat: koin, bonus, profil: await profil(u) });
    }
    // ---- kebutuhan avatar (game): lapar, energi, kebersihan, mood, inspirasi ----
    if (a === 'status' || a === 'aksi' || a === 'kerja') {
      const [raw, koinS] = await redis([['GET', 'need:' + u], ['GET', 'koin:' + u]]);
      const n = needNow(raw); const now = Date.now(); let koin = +koinS || 0;
      if (a === 'status') { const c = [['SET', 'need:' + u, JSON.stringify(n)]]; if (!n.zz) c.push(['ZREM', 'tidur', u]); await redis(c); return send(res, 200, { ok: true, need: needOut(n, koin) }) }
      if (a === 'aksi') {
        const j = String(body.j || ''); const A = AKSI[j];
        if (!A) return send(res, 400, { error: 'Aksi tidak dikenal.' });
        const [rl] = await redis([['SET', 'rln:' + u, '1', 'NX', 'PX', '1200']]);
        if (!rl) return send(res, 429, { error: 'Pelan-pelan ya.', need: needOut(n, koin) });
        if (j === 'tidur') {
          if (n.zz) return send(res, 200, { ok: true, need: needOut(n, koin) });
          if (n.e >= 95) return send(res, 400, { error: 'Belum ngantuk, energimu masih penuh.', need: needOut(n, koin) });
          n.zz = now; const wake = now + Math.ceil((100 - n.e) / SLEEP_RATE * 36e5);
          await redis([['SET', 'need:' + u, JSON.stringify(n)], ['ZADD', 'tidur', String(wake), u]]);
          return send(res, 200, { ok: true, need: needOut(n, koin) });
        }
        if (j === 'bangun') {
          n.zz = null; n.woke = now;
          await redis([['SET', 'need:' + u, JSON.stringify(n)], ['ZREM', 'tidur', u]]);
          return send(res, 200, { ok: true, need: needOut(n, koin) });
        }
        if (n.zz) return send(res, 400, { error: 'Avatarmu lagi tidur 😴 Bangun dulu.', need: needOut(n, koin) });
        if (A.cd && n.cd[j] && now < n.cd[j]) return send(res, 429, { error: 'Bisa lagi ' + Math.ceil((n.cd[j] - now) / 60000) + ' menit lagi.', need: needOut(n, koin) });
        if (A.koin && koin < A.koin) return send(res, 400, { error: 'Koin Nada kurang. Kerja dulu di Gedung Musik atau Kantor ISR.', need: needOut(n, koin) });
        for (const k of ['l', 'e', 'b', 'm', 'i']) if (A[k]) n[k] = Math.min(100, n[k] + A[k]);
        if (A.cd) n.cd[j] = now + A.cd * 60000;
        const cmds = [['SET', 'need:' + u, JSON.stringify(n)]]; if (A.koin) cmds.push(['DECRBY', 'koin:' + u, String(A.koin)]);
        const out = await redis(cmds); if (A.koin) koin = +out[1];
        return send(res, 200, { ok: true, need: needOut(n, koin) });
      }
      // kerja: dipanggil setelah mini game selesai; gaji sesuai akurasi, jabatan & inspirasi
      const acc = Math.max(0, Math.min(1, +body.acc || 0));
      if (n.zz) return send(res, 400, { error: 'Avatarmu lagi tidur 😴 Bangun dulu baru kerja.', need: needOut(n, koin) });
      if (['l', 'e', 'b', 'm', 'i'].some(k => n[k] <= 0)) return send(res, 400, { error: 'Avatarmu lemas. Rawat dulu (makan, tidur, mandi) baru bisa kerja.', need: needOut(n, koin) });
      if (n.e < 20) return send(res, 400, { error: 'Energi kurang. Tidur dulu di rumah.', need: needOut(n, koin) });
      const [rl] = await redis([['SET', 'rlk:' + u, '1', 'NX', 'PX', '25000']]);
      if (!rl) return send(res, 429, { error: 'Istirahat sebentar sebelum kerja lagi.', need: needOut(n, koin) });
      const lv = Math.min(5, Math.floor((n.kc || 0) / 10));
      const gaji = Math.min(90, Math.round((20 + 40 * acc) * (1 + 0.1 * lv) * (n.i >= 70 ? 1.2 : 1)));
      n.e = Math.max(0, n.e - 20); n.l = Math.max(0, n.l - 10); n.b = Math.max(0, n.b - 5); n.m = Math.min(100, n.m + 5); n.i = Math.max(0, n.i - 3); n.kc = (n.kc || 0) + 1;
      const out = await redis([['SET', 'need:' + u, JSON.stringify(n)], ['INCRBY', 'koin:' + u, String(gaji)], ['INCRBY', 'exp:' + u, String(gaji)], ['ZINCRBY', 'papan:exp', String(gaji), u]]);
      const naik = Math.min(5, Math.floor(n.kc / 10)) > lv;
      return send(res, 200, { ok: true, gaji, naik, need: needOut(n, +out[1]) });
    }
    return send(res, 400, { error: 'Aksi tidak dikenal.' });
  } catch (e) {
    return send(res, 500, { error: 'Server kota lagi sibuk, coba lagi sebentar.' });
  }
};
