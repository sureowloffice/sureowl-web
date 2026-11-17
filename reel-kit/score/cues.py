# Komposer scoring film sederhana: tiap suasana menghasilkan daftar nada untuk satu segmen waktu.
import numpy as np
# GM program
STR, SLOW, TREM, PIZZ, HARP, TIMP, CB, CELLO = 48, 49, 44, 45, 46, 47, 43, 42
PIANO, CELESTA, GLOCK, XYLO, MARIMBA = 0, 8, 9, 13, 12
HORN, BRASS, TPT, TBN, BSN, CLAR, FLUTE, OBOE, CHOIR, HIT = 60, 61, 56, 57, 70, 71, 73, 68, 52, 55
DR = 128  # bank perkusi (prog 0)
BD, SN, CRASH, RIDE, TOM, CLAP, TRI = 36, 38, 49, 51, 45, 39, 81

MAJ = [0, 2, 4, 5, 7, 9, 11]; MIN = [0, 2, 3, 5, 7, 8, 10]
def chord(root, q='maj'):
    return [root, root + (4 if q == 'maj' else 3), root + 7]

class Cue:
    def __init__(s, t0, t1, key=60):
        s.t0, s.t1, s.k, s.n = t0, t1, key, []
    def add(s, t, d, key, vel, prog, pan=0.0, bank=0):
        if s.t0 <= t < s.t1:
            s.n.append((t, min(d, s.t1 - t + .6), key, vel, bank, prog, pan))
    def dr(s, t, key, vel, d=.4, pan=0):
        s.add(t, d, key, vel, 0, pan, bank=DR)

def hit(c):  # hentakan orkestra + timpani, lalu hening
    t = c.t0; k = c.k
    for p in [k - 12, k, k + 7]: c.add(t, .5, p, 120, HIT)
    for p in [k - 24, k - 12]: c.add(t, 1.2, p, 120, BRASS)
    c.dr(t, CRASH, 120, 2); c.dr(t, BD, 127)
    for i in range(10): c.add(t + i * .045, .2, k - 24, 70 + i * 5, TIMP)
    c.add(t + .46, 1.6, k - 24, 125, TIMP)

def komedi(c, bpm=126):
    b = 60 / bpm; k = c.k; prog = [0, 5, 7, 0]
    t = c.t0; i = 0
    mel = [0, 4, 7, 4, 9, 7, 4, 2, 0, 2, 4, 0, -1, 2, 7, 5]
    while t < c.t1:
        r = k - 24 + prog[(i // 4) % 4]
        c.add(t, b * .3, r if i % 2 == 0 else r + 7, 92, PIZZ, -.3)
        if i % 2 == 1: c.add(t, b * .25, r + 24 + (4 if prog[(i // 4) % 4] in (0, 5) else 3), 70, PIZZ, .3)
        m = mel[i % 16]
        if i % 4 != 3: c.add(t + (b / 2 if i % 8 == 6 else 0), b * .35, k + m, 84, BSN, .1)
        if i % 8 == 7: c.add(t + b * .5, b * .2, k + 12 + m, 78, XYLO, .4)
        t += b; i += 1

def tegang(c, accel=True):
    k = c.k - 12; d = c.t1 - c.t0
    for p in [k - 12, k, k + 1, k + 6]: c.add(c.t0, d + .5, p, 70, TREM, (p % 3 - 1) * .3)
    c.add(c.t0, d + .5, k - 12, 85, CB)
    t = c.t0; gap = .7
    while t < c.t1:
        c.add(t, .4, k - 12, 100, TIMP); c.add(t + .14, .3, k - 12, 70, TIMP)
        t += gap; gap = max(.28, gap * (.93 if accel else 1))
    c.add(c.t0 + d * .5, d * .5 + .5, k + 13, 55, TREM, .5)

def haru(c, bpm=72):
    b = 60 / bpm; k = c.k
    prog = [(0, 'maj'), (7, 'maj'), (9, 'min'), (5, 'maj')]
    t = c.t0; i = 0
    while t < c.t1:
        r, q = prog[(i // 4) % 4]; ch = chord(k - 12 + r, q)
        arp = [ch[0], ch[1] + 12, ch[2] + 12, ch[1] + 12] if True else ch
        c.add(t, b * 1.6, arp[i % 4], 62 + (8 if i % 4 == 0 else 0), PIANO, -.2)
        if i % 4 == 0:
            c.add(t, b * 4.2, ch[0] - 12, 60, PIANO, -.2)
            for p in chord(k + r, q): c.add(t, b * 4.2, p, 48 + min(30, i * 2), SLOW, .2)
            c.add(t, b * 4.2, k - 24 + r, 55, CELLO, -.1)
        t += b; i += 1

def heroik(c, bpm=96):
    b = 60 / bpm; k = c.k
    prog = [(0, 'maj'), (5, 'maj'), (7, 'maj'), (0, 'maj')]
    c.dr(c.t0, CRASH, 115, 2); c.dr(c.t0, BD, 120)
    t = c.t0; i = 0
    mel = [7, 12, 14, 16, 14, 12, 19, 16]
    while t < c.t1:
        r, q = prog[(i // 2) % 4]
        for p in chord(k - 12 + r, q): c.add(t, b * 2.1, p, 100, BRASS)
        for p in chord(k + r, q): c.add(t, b * 2.1, p, 85, STR, .2)
        c.add(t, b * 2.1, k - 24 + r, 95, CB)
        c.add(t, .3, k - 24 + r, 115, TIMP); c.add(t + b, .3, k - 24 + r, 90, TIMP)
        c.add(t, b * 1.9, k + mel[i % 8], 100, HORN, -.2)
        c.dr(t, BD, 100); c.dr(t + b, SN, 70)
        t += 2 * b; i += 1

def kerja(c, bpm=128):
    s16 = 60 / bpm / 4; k = c.k
    pat = [0, 7, 12, 7, 4, 7, 12, 16]
    t = c.t0; i = 0; prog = [0, 0, 5, 7]
    while t < c.t1:
        r = prog[(i // 32) % 4]
        if i % 2 == 0: c.add(t, s16 * 1.5, k + r + pat[(i // 2) % 8], 78, MARIMBA, .3)
        if i % 4 == 0: c.add(t, s16 * 1.2, k - 12 + r, 80, STR, -.3)
        if i % 8 == 4: c.dr(t, SN, 55)
        if i % 8 == 0: c.dr(t, BD, 80)
        if i % 2 == 1: c.dr(t, 42, 40)  # hi-hat
        t += s16; i += 1

def ceria(c, bpm=110):
    b = 60 / bpm; k = c.k
    prog = [(0, 'maj'), (9, 'min'), (5, 'maj'), (7, 'maj')]
    mel = [4, 7, 12, 11, 9, 7, 9, 12, 16, 14, 12, 7]
    t = c.t0; i = 0
    while t < c.t1:
        r, q = prog[(i // 4) % 4]
        if i % 4 == 0:
            for p in chord(k + r, q): c.add(t, b * 4, p, 70, STR)
            c.add(t, b * 4, k - 24 + r, 75, CB)
        c.add(t, b * .5, k - 12 + r + (7 if i % 2 else 0), 80, PIZZ, -.3)
        c.add(t, b * .9, k + 12 + mel[i % 12], 72, GLOCK, .35)
        if i % 2 == 0: c.add(t, b * .9, k + mel[i % 12], 70, FLUTE, -.1)
        t += b; i += 1

def misteri(c, bpm=70):
    b = 60 / bpm; k = c.k
    d = c.t1 - c.t0
    for p in [k + 12, k + 15, k + 18]: c.add(c.t0, d + 1, p, 45, SLOW, .4)
    c.add(c.t0, d + 1, k - 24, 60, CB)
    mot = [0, 3, 6, 9, 8, 6, 3, 2]
    t = c.t0; i = 0
    while t < c.t1:
        c.add(t, b * .8, k + 12 + mot[i % 8], 70, CELESTA, (i % 3 - 1) * .4)
        t += b * .75; i += 1
    for j in range(8): c.add(c.t0 + j * .05, .6, k + 12 + j * 3, 50, HARP, .2)

def sedih(c, bpm=60):
    b = 60 / bpm; k = c.k
    c.add(c.t0, c.t1 - c.t0 + .5, k - 12, 55, SLOW); c.add(c.t0, c.t1 - c.t0 + .5, k - 9, 50, SLOW)
    for i, m in enumerate([7, 5, 3, 2, 0]):
        c.add(c.t0 + i * b * .8, b * .9, k + m, 70, OBOE)

MOODS = {'hit': hit, 'komedi': komedi, 'tegang': tegang, 'haru': haru, 'heroik': heroik, 'kerja': kerja, 'ceria': ceria, 'misteri': misteri, 'sedih': sedih}

def score(sheet, key=60):
    """sheet: list of (t0, t1, mood) ; mood 'diam' = hening"""
    notes = []
    for t0, t1, m in sheet:
        if m == 'diam': continue
        c = Cue(t0, t1, key); MOODS[m](c); notes += c.n
    return notes

LEVEL = {'hit': .16, 'komedi': .07, 'tegang': .075, 'haru': .065, 'heroik': .11, 'kerja': .07, 'ceria': .075, 'misteri': .06, 'sedih': .06}
def make_score(sheet, total, synth, key=60):
    from sf2 import render, SR
    N = int((total + 3) * SR); out = np.zeros((N, 2), np.float32)
    for t0, t1, m in sheet:
        if m == 'diam': continue
        c = Cue(t0, t1, key); MOODS[m](c)
        a = render(c.n, total, synth, reverb=.3)[:N]
        seg = a[int(t0 * SR):int(t1 * SR)]
        rms = float(np.sqrt(np.mean(seg ** 2))) + 1e-9
        a *= LEVEL[m] / rms
        # potong ekor di 1.2 dtk setelah segmen (fade), kecuali hit
        tail = 1.2 if m != 'hit' else 2.0
        e = int((t1 + tail) * SR)
        if e < N:
            f = int(.25 * SR); a[e - f:e] *= np.linspace(1, 0, f)[:, None]; a[e:] = 0
        out += a
    for t0, t1, m in sheet:  # hening total
        if m == 'diam':
            i, j = int(t0 * SR), int(t1 * SR); f = int(.08 * SR)
            out[i - f:i] *= np.linspace(1, 0, f)[:, None]; out[i:j] = 0
    return out[:int(total * SR)]
