// SureOwl — membuat invoice pembayaran Mayar dari isi keranjang.
// Harga SELALU diambil dari catalog.json di server, bukan dari browser,
// jadi pembeli tidak bisa mengubah harga.
//
// Environment variables (diatur di Vercel > Settings > Environment Variables):
//   MAYAR_API_KEY  : API key dari https://web.mayar.id/api-keys (Read & Write)
//   MAYAR_ENV      : "production" (default) atau "sandbox" untuk uji coba
//   SITE_URL       : opsional, mis. https://sureowl.vercel.app

const catalog = require('../catalog.json');

const MAX_QTY = 10;
const MAX_LINES = 20;

function bad(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

function clean(v, max) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

function normalizeMobile(raw) {
  let d = String(raw || '').replace(/[^0-9+]/g, '');
  if (d.startsWith('+62')) d = '0' + d.slice(3);
  else if (d.startsWith('62')) d = '0' + d.slice(2);
  return /^08[0-9]{7,12}$/.test(d) ? d : null;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return bad(res, 405, 'Metode tidak didukung.');
  }

  const apiKey = process.env.MAYAR_API_KEY;
  if (!apiKey) {
    return bad(res, 503, 'Pembayaran online belum aktif. Silakan order lewat WhatsApp.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { return bad(res, 400, 'Data tidak valid.'); }
  }
  body = body || {};

  // --- Validasi pembeli ---
  const name = clean(body.name, 80);
  const email = clean(body.email, 120).toLowerCase();
  const mobile = normalizeMobile(body.mobile);
  const song = clean(body.song, 160);
  const link = clean(body.link, 300);
  const release = clean(body.release, 20);
  const note = clean(body.note, 500);

  if (name.length < 2) return bad(res, 400, 'Nama wajib diisi.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(res, 400, 'Email tidak valid.');
  if (!mobile) return bad(res, 400, 'Nomor WhatsApp tidak valid. Contoh: 081234567890');
  if (song.length < 2) return bad(res, 400, 'Judul lagu wajib diisi.');

  // --- Validasi keranjang, harga dari katalog ---
  const lines = Array.isArray(body.items) ? body.items.slice(0, MAX_LINES) : [];
  if (!lines.length) return bad(res, 400, 'Keranjang masih kosong.');

  const byId = new Map(catalog.items.map((it) => [it.id, it]));
  const items = [];
  let total = 0;
  for (const line of lines) {
    const product = byId.get(String(line && line.id));
    const qty = Math.floor(Number(line && line.qty));
    if (!product) return bad(res, 400, 'Ada item yang tidak dikenal di keranjang.');
    if (!(qty >= 1 && qty <= MAX_QTY)) return bad(res, 400, 'Jumlah item tidak valid.');
    items.push({ quantity: qty, rate: product.price, description: product.name });
    total += qty * product.price;
  }

  // --- Buat invoice di Mayar ---
  const base = process.env.MAYAR_ENV === 'sandbox'
    ? 'https://api.mayar.io/hl/v1'
    : 'https://api.mayar.id/hl/v1';
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const siteUrl = (process.env.SITE_URL || ('https://' + host)).replace(/\/$/, '');
  const ref = 'SO-' + Date.now().toString(36).toUpperCase();

  const description = [
    'SureOwl ' + ref,
    'Lagu: ' + song,
    release ? 'Rilis: ' + release : '',
    link ? 'Link: ' + link : '',
    note ? 'Catatan: ' + note : ''
  ].filter(Boolean).join(' | ').slice(0, 900);

  const payload = {
    name,
    email,
    mobile,
    redirectUrl: siteUrl + '/terima-kasih.html?ref=' + encodeURIComponent(ref),
    description,
    expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    items,
    extraData: { noCustomer: ref, idProd: items.map((i) => i.description).join(', ').slice(0, 200) }
  };

  try {
    const r = await fetch(base + '/invoice/create', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(() => ({}));
    const inv = Array.isArray(data.data) ? data.data[0] : data.data;
    if (!r.ok || !inv || !inv.link) {
      console.error('Mayar error', r.status, JSON.stringify(data).slice(0, 500));
      return bad(res, 502, 'Gagal membuat tagihan. Coba lagi atau order lewat WhatsApp.');
    }
    return res.status(200).json({ ok: true, ref, total, payUrl: inv.link });
  } catch (err) {
    console.error('Mayar request failed', err && err.message);
    return bad(res, 502, 'Layanan pembayaran sedang sibuk. Coba lagi atau order lewat WhatsApp.');
  }
};
