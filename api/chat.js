// Kota Seni — Pesan Warga (chat) · Vercel serverless + Upstash Redis REST
const crypto = require('crypto');

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEEP = 300;          // pesan yang disimpan
const MAXLEN = 200;        // panjang maksimal pesan
const BAD = ['anjing','anjg','bangsat','bgst','kontol','kntl','memek','mmk','ngentot','ngentod','jembut','pepek','goblok','tolol','babi','asu','bajingan','perek','lonte','pelacur','fuck','shit','bitch','nigga','judol','slot gacor'];

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
async function warga(host) {
  if (wargaCache.set && Date.now() - wargaCache.at < 60000) return wargaCache.set;
  const r = await fetch('https://' + host + '/warga.json?nc=' + Date.now());
  const d = await r.json();
  wargaCache = { at: Date.now(), set: new Set(d.warga.map(w => String(w.u).toLowerCase())) };
  return wargaCache.set;
}

function clean(t) {
  t = String(t || '').replace(/[\u0000-\u001F\u007F\u200B-\u200F\u202A-\u202E]/g, ' ').replace(/\s+/g, ' ').trim();
  if (t.length > MAXLEN) t = t.slice(0, MAXLEN);
  const low = t.toLowerCase().replace(/[0@]/g, 'o').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a').replace(/5/g, 's');
  for (const w of BAD) if (new RegExp('(^|[^a-z])' + w + '([^a-z]|$)').test(low)) return { bad: true };
  if (/(https?:\/\/|www\.|\.com\b|\.id\b|bit\.ly|wa\.me|t\.me)/i.test(t)) return { link: true };
  return { t };
}

function send(res, code, obj) {
  res.statusCode = code;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(obj));
}

module.exports = async (req, res) => {
  if (!URL_ || !TOKEN) return send(res, 503, { error: 'Chat belum aktif.' });
  try {
    if (req.method === 'GET') {
      const [list] = await redis([['LRANGE', 'chat', '0', '79']]);
      const msgs = (list || []).map(s => { try { return JSON.parse(s) } catch (e) { return null } }).filter(Boolean).reverse();
      return send(res, 200, { msgs });
    }
    if (req.method !== 'POST') return send(res, 405, { error: 'Metode tidak didukung.' });

    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body) } catch (e) { body = {} } }
    body = body || {};
    const u = String(body.u || '').trim().replace(/^@/, '').toLowerCase().slice(0, 40);
    const key = String(body.k || '');
    if (!u || !/^[a-z0-9._]+$/.test(u)) return send(res, 400, { error: 'Username tidak valid.' });
    if (key.length < 16 || key.length > 80) return send(res, 400, { error: 'Sesi tidak valid, muat ulang halaman.' });

    const host = req.headers['x-forwarded-host'] || req.headers.host || 'kotaseni.vercel.app';
    const set = await warga(host);
    if (!set.has(u)) return send(res, 403, { error: 'Cuma warga terdaftar yang bisa ngobrol. Komen NADA dulu di @viralindongid.' });

    const c = clean(body.t);
    if (c.bad) return send(res, 400, { error: 'Pesanmu mengandung kata kasar. Yuk ngobrol yang asik.' });
    if (c.link) return send(res, 400, { error: 'Link tidak boleh dikirim di chat kota.' });
    if (!c.t) return send(res, 400, { error: 'Pesan kosong.' });

    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'x';
    const kh = crypto.createHash('sha256').update(key).digest('hex').slice(0, 32);
    const [claimSet, claim, rlU, rlIp, banned] = await redis([
      ['SET', 'claim:' + u, kh, 'NX'],
      ['GET', 'claim:' + u],
      ['SET', 'rl:u:' + u, '1', 'NX', 'EX', '6'],
      ['SET', 'rl:ip:' + ip, '1', 'NX', 'EX', '3'],
      ['SISMEMBER', 'banned', u]
    ]);
    if (banned) return send(res, 403, { error: 'Akun ini sedang dibatasi oleh Wali Kota.' });
    if (claim !== kh) return send(res, 403, { error: 'Username ini sudah dipakai ngobrol di perangkat lain. Kalau ini akunmu, DM @viralindongid.' });
    if (!rlU || !rlIp) return send(res, 429, { error: 'Pelan-pelan, tunggu beberapa detik ya.' });

    const msg = { id: Date.now().toString(36) + crypto.randomBytes(3).toString('hex'), u, t: c.t, ts: Date.now() };
    await redis([['LPUSH', 'chat', JSON.stringify(msg)], ['LTRIM', 'chat', '0', String(KEEP - 1)]]);
    return send(res, 200, { ok: true, msg });
  } catch (e) {
    return send(res, 500, { error: 'Server kota lagi sibuk, coba lagi sebentar.' });
  }
};
