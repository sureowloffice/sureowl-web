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
  wargaCache = { at: Date.now(), set: new Set(d.warga.map(w => String(w.u).toLowerCase())) };
  return wargaCache.set;
}

const today = () => new Date(Date.now() + 7 * 36e5).toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() + 7 * 36e5 - 864e5).toISOString().slice(0, 10);
const level = exp => Math.floor(Math.sqrt((exp || 0) / 25)) + 1;
const hashKey = k => crypto.createHash('sha256').update(k).digest('hex').slice(0, 32);

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

async function profil(u) {
  const d = today();
  const [koin, exp, streak, last, done, ver, chatc] = await redis([
    ['GET', 'koin:' + u], ['GET', 'exp:' + u], ['GET', 'streak:' + u], ['GET', 'absen:' + u],
    ['SMEMBERS', 'misi:' + u + ':' + d], ['GET', 'ver:' + u], ['GET', 'chatc:' + u + ':' + d]
  ]);
  const e = +exp || 0, lv = level(e);
  return {
    u, koin: +koin || 0, exp: e, level: lv, nextExp: 25 * lv * lv, prevExp: 25 * (lv - 1) * (lv - 1),
    streak: last === d || last === yesterday() ? (+streak || 0) : 0, absenHariIni: last === d,
    misi: done || [], verified: !!ver, chatHariIni: +chatc || 0, tanggal: d
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

    const key = String(body.k || '');
    if (!u || !/^[a-z0-9._]+$/.test(u)) return send(res, 400, { error: 'Username tidak valid.' });
    if (key.length < 16 || key.length > 80) return send(res, 400, { error: 'Sesi tidak valid, muat ulang halaman.' });
    const set = await warga(host);
    if (!set.has(u)) return send(res, 403, { error: 'Username ini belum jadi warga. Komen NADA dulu di @viralindongid.' });
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

    if (a === 'pos') { // posisi karakter saat mode main
      const num = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round((+v || 0) * 100) / 100));
      const p = { x: num(body.x, -60, 60), z: num(body.z, -80, 34), yaw: num(body.yaw, -50, 50), emo: ['wave', 'dance', 'music'].includes(body.emo) ? body.emo : '' };
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
      await redis([['INCRBY', 'koin:' + u, String(koin)], ['INCRBY', 'exp:' + u, String(koin)], ['ZINCRBY', 'papan:exp', String(koin), u]]);
      return send(res, 200, { ok: true, dapat: koin, bonus, profil: await profil(u) });
    }
    return send(res, 400, { error: 'Aksi tidak dikenal.' });
  } catch (e) {
    return send(res, 500, { error: 'Server kota lagi sibuk, coba lagi sebentar.' });
  }
};
