# Pemutar SoundFont (SF2) sederhana: baca preset, pilih sampel per nada, render ke numpy.
import struct, numpy as np

SR = 44100

class SF2:
    def __init__(s, path):
        d = open(path, 'rb').read()
        s.chunks = {}
        s._walk(d, 12, len(d))
        raw = s.chunks['smpl']
        s.smpl = np.frombuffer(raw, dtype='<i2').astype(np.float32) / 32768.0
        P = s.chunks
        s.phdr = [struct.unpack('<20sHHHIII', P['phdr'][i:i+38]) for i in range(0, len(P['phdr']), 38)]
        s.pbag = [struct.unpack('<HH', P['pbag'][i:i+4]) for i in range(0, len(P['pbag']), 4)]
        s.pgen = [struct.unpack('<HH', P['pgen'][i:i+4]) for i in range(0, len(P['pgen']), 4)]
        s.inst = [struct.unpack('<20sH', P['inst'][i:i+22]) for i in range(0, len(P['inst']), 22)]
        s.ibag = [struct.unpack('<HH', P['ibag'][i:i+4]) for i in range(0, len(P['ibag']), 4)]
        s.igen = [struct.unpack('<HH', P['igen'][i:i+4]) for i in range(0, len(P['igen']), 4)]
        s.shdr = [struct.unpack('<20sIIIIIBbHH', P['shdr'][i:i+46]) for i in range(0, len(P['shdr']), 46)]
        s.cache = {}

    def _walk(s, d, a, b):
        i = a
        while i + 8 <= b:
            cid = d[i:i+4].decode('latin1'); n = struct.unpack('<I', d[i+4:i+8])[0]
            if cid == 'LIST':
                s._walk(d, i + 12, i + 8 + n)
            else:
                s.chunks[cid] = d[i+8:i+8+n]
            i += 8 + n + (n & 1)

    @staticmethod
    def _gens(glist, a, b):
        g = {}
        for op, amt in glist[a:b]:
            g[op] = amt
        return g

    def _zones(s, bags, gens, a, b, key_term):
        zs = []; glob = {}
        for k in range(a, b):
            g = s._gens(gens, bags[k][0], bags[k+1][0])
            if key_term not in g:
                if k == a: glob = g
                continue
            zs.append(g)
        return glob, zs

    def preset(s, bank, prog):
        key = (bank, prog)
        if key in s.cache: return s.cache[key]
        idx = None
        for i, p in enumerate(s.phdr[:-1]):
            if p[1] == prog and p[2] == bank: idx = i; break
        if idx is None:
            for i, p in enumerate(s.phdr[:-1]):
                if p[1] == prog and p[2] == 0: idx = i; break
        p = s.phdr[idx]; q = s.phdr[idx+1]
        pg, pz = s._zones(s.pbag, s.pgen, p[3], q[3], 41)
        out = []
        for z in pz:
            ii = z[41]; I = s.inst[ii]; J = s.inst[ii+1]
            ig, iz = s._zones(s.ibag, s.igen, I[1], J[1], 53)
            for zz in iz:
                g = dict(ig); g.update(zz)
                pgz = dict(pg); pgz.update(z)
                out.append((g, pgz))
        s.cache[key] = out
        return out

def rng(g, op):
    if op in g:
        v = g[op]; return (v & 255, v >> 8)
    return (0, 127)

def sgn(v):
    return v - 65536 if v >= 32768 else v

def tc(g, op, d=-12000):
    return 2 ** (sgn(g.get(op, d & 0xFFFF if d < 0 else d)) / 1200.0) if op in g else 2 ** (d / 1200.0)

class Synth:
    def __init__(s, path):
        s.sf = SF2(path)

    def note(s, bank, prog, key, vel, dur, pan=0.0):
        """render satu nada -> (L,R) numpy"""
        sf = s.sf; outL = None; outR = None
        for g, pg in sf.preset(bank, prog):
            klo, khi = rng(g, 43); vlo, vhi = rng(g, 44)
            pk, pk2 = rng(pg, 43); pv, pv2 = rng(pg, 44)
            if not (klo <= key <= khi and vlo <= vel <= vhi and pk <= key <= pk2 and pv <= vel <= pv2): continue
            sh = sf.shdr[g[53]]
            name, st, en, ls, le, ssr, root, corr, link, stype = sh
            st += sgn(g.get(0, 0)) + 32768 * sgn(g.get(4, 0)); en += sgn(g.get(1, 0)) + 32768 * sgn(g.get(12, 0))
            ls += sgn(g.get(2, 0)) + 32768 * sgn(g.get(45, 0)); le += sgn(g.get(3, 0)) + 32768 * sgn(g.get(50, 0))
            rk = g.get(58, 65535)
            if rk != 65535 and rk < 128: root = rk
            scale = g.get(56, 100)
            coarse = sgn(g.get(51, 0)) + sgn(pg.get(51, 0)); fine = sgn(g.get(52, 0)) + sgn(pg.get(52, 0))
            semis = (key - root) * scale / 100.0 + coarse + (fine + corr) / 100.0
            step = 2 ** (semis / 12.0) * ssr / SR
            mode = g.get(54, 0) & 3
            # envelope (timecents; preset values additive)
            def T(op, dflt=-12000):
                v = sgn(g.get(op, dflt & 0xFFFF)) + sgn(pg.get(op, 0))
                return 2 ** (v / 1200.0)
            dly = T(33); att = T(34); hold = T(35); dec = T(36); rel = T(38)
            sus_cb = max(0, sgn(g.get(37, 0)) + sgn(pg.get(37, 0)))
            atten = max(0, sgn(g.get(48, 0)) + sgn(pg.get(48, 0))) * 0.4
            p = (sgn(g.get(17, 0)) + sgn(pg.get(17, 0))) / 500.0 + pan
            rel = min(rel, 3.0)
            total = dur + rel
            n = int(total * SR)
            pos = st + np.arange(n) * step
            if mode in (1, 3) and le > ls + 4:
                L = le - ls
                over = pos >= le
                pos = np.where(over, ls + np.mod(pos - ls, L), pos)
            else:
                pos = np.minimum(pos, en - 2)
            i0 = pos.astype(np.int64); fr = (pos - i0).astype(np.float32)
            i0 = np.clip(i0, 0, len(sf.smpl) - 2)
            w = sf.smpl[i0] * (1 - fr) + sf.smpl[i0 + 1] * fr
            if mode not in (1, 3):
                w[(st + np.arange(n) * step) >= en - 2] = 0
            t = np.arange(n) / SR
            sus = 10 ** (-sus_cb / 200.0)
            env = np.ones(n, np.float32)
            a0 = dly; a1 = a0 + att; h1 = a1 + hold
            env = np.where(t < a0, 0, env)
            env = np.where((t >= a0) & (t < a1), (t - a0) / max(att, 1e-4), env)
            dd = np.clip((t - h1) / max(dec, 1e-3), 0, 1)
            env = np.where(t >= h1, 1 - (1 - sus) * dd, env)
            # release
            rr = np.clip((t - dur) / max(rel, 1e-3), 0, 1)
            env = np.where(t >= dur, env * (1 - rr) ** 2 * np.exp(-3 * rr), env)
            amp = 10 ** (-atten / 200.0) * (vel / 127.0) ** 1.6
            sig = w * env * amp
            pl = np.clip((p + 1) / 2, 0, 1)
            l = sig * np.cos(pl * np.pi / 2); r = sig * np.sin(pl * np.pi / 2)
            if outL is None: outL, outR = l, r
            else:
                m = max(len(outL), len(l))
                outL = np.pad(outL, (0, m - len(outL))) + np.pad(l, (0, m - len(l)))
                outR = np.pad(outR, (0, m - len(outR))) + np.pad(r, (0, m - len(r)))
        if outL is None: return np.zeros(1), np.zeros(1)
        return outL, outR

def render(notes, total, synth, reverb=0.25):
    """notes: list of (t, dur, key, vel, bank, prog, pan)"""
    N = int((total + 3) * SR); L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
    for t, dur, key, vel, bank, prog, pan in notes:
        l, r = synth.note(bank, prog, int(key), int(max(1, min(127, vel))), dur, pan)
        i = int(t * SR); j = min(N, i + len(l))
        if i >= N: continue
        L[i:j] += l[:j - i]; R[i:j] += r[:j - i]
    if reverb > 0:
        rng_ = np.random.default_rng(1); n = int(2.2 * SR); tt = np.arange(n) / SR
        irL = rng_.standard_normal(n) * np.exp(-tt * 3.2); irR = rng_.standard_normal(n) * np.exp(-tt * 3.2)
        irL[:int(.012 * SR)] = 0; irR[:int(.017 * SR)] = 0
        irL /= np.sqrt((irL ** 2).sum()); irR /= np.sqrt((irR ** 2).sum())
        from scipy.signal import fftconvolve
        L = L + reverb * fftconvolve(L, irL)[:N]; R = R + reverb * fftconvolve(R, irR)[:N]
    return np.stack([L, R], 1)
