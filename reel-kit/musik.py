# Musik latar orisinal (disintesis, bebas hak cipta). Pakai: python3 musik.py <detik> <out.wav> [gaya] [seed]
# gaya: ceria (default) | megah | santai | heboh (128bpm, langsung beat)
import sys,numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfilt
DUR=float(sys.argv[1]);OUT=sys.argv[2];GAYA=sys.argv[3] if len(sys.argv)>3 else 'ceria';SEED=int(sys.argv[4]) if len(sys.argv)>4 else 3
SR=44100;N=int(SR*DUR);rng=np.random.default_rng(SEED);MUS=np.zeros((N,2))
def f(s,k,fr,o=2):return sosfilt(butter(o,fr,k,fs=SR,output='sos'),s)
def T(d):return np.arange(int(d*SR))/SR
def put(sig,t0,g=1.,pan=0.):
    i=int(t0*SR)
    if i<0 or i>=N:return
    s=sig[:N-i]*g;MUS[i:i+len(s),0]+=s*np.sqrt((1-pan)/2)*1.414;MUS[i:i+len(s),1]+=s*np.sqrt((1+pan)/2)*1.414
def midi(m):return 440*2**((m-69)/12)
def marimba(m,d=.5,g=1):
    t=T(d);fr=midi(m);s=np.sin(2*np.pi*fr*t)+.35*np.sin(2*np.pi*fr*4*t)*np.exp(-t*30)
    return s*np.exp(-t*7)*np.minimum(1,t/.002)*.13*g
def pluck(m,d=.6,g=1):
    t=T(d);fr=midi(m);s=sum(np.sin(2*np.pi*fr*k*t)/k*np.exp(-t*(3+k*2)) for k in range(1,6));return s*np.minimum(1,t/.003)*.11*g
def kick(g=1):
    t=T(.35);fr=45+110*np.exp(-t*35);return np.tanh(2*np.sin(2*np.pi*np.cumsum(fr)/SR)*np.exp(-t*8))*.5*g
def snap(g=1):
    t=T(.2);n=f(rng.standard_normal(len(t)),'band',[1200,6000]);e=sum((t>=dd)*np.exp(-(t-dd).clip(0)*45) for dd in (0,.01));return n*e*.22*g
def shaker(g=1):
    t=T(.08);return f(rng.standard_normal(len(t)),'high',6000)*np.exp(-t*60)*.08*g
def bass(m,d,g=1):
    t=T(d);s=np.sin(2*np.pi*midi(m)*t)+.3*np.sin(2*np.pi*midi(m)*2*t);return s*np.minimum(1,t/.01)*np.minimum(1,(d-t)/.05).clip(0)*.22*g
G={'ceria':dict(bpm=112,prog=[(60,[60,64,67,72]),(57,[57,60,64,69]),(53,[53,57,60,65]),(55,[55,59,62,67])],mel=[72,76,79,76,74,72,74,76,72,69,72,76,74,71,72,74]),
   'megah':dict(bpm=120,prog=[(57,[57,60,64,69]),(53,[53,57,60,65]),(60,[60,64,67,72]),(55,[55,59,62,67])],mel=[69,72,76,81,79,76,72,74,76,79,81,84,83,79,76,74]),
   'heboh':dict(bpm=128,prog=[(57,[57,60,64,69]),(53,[53,57,60,65]),(60,[60,64,67,72]),(55,[55,59,62,67])],mel=[69,76,72,76,81,76,72,76,69,76,72,79,83,79,76,74]),
   'santai':dict(bpm=92,prog=[(62,[62,65,69,72]),(55,[55,59,62,65]),(60,[60,64,67,71]),(57,[57,60,64,67])],mel=[74,72,69,72,74,77,76,72,71,72,74,76,74,72,69,67])}[GAYA]
B=60/G['bpm'];nb=int(DUR/B)
for k in range(nb):
    t0=k*B
    if t0>DUR-2.4:break
    root,ch=G['prog'][(k//4)%4];pos=k%4;intro=t0<1.2 and GAYA!='heboh';build=GAYA=='heboh' or (k//16)%2==1
    if not intro:
        if pos in (0,2):put(kick(.85 if build else .6),t0)
        if pos in (1,3):put(snap(.9 if build else .6),t0,1,.1)
        for h in range(2):put(shaker(1.3),t0+h*B/2,1,.3)
    if pos==0:put(bass(root-24,B*1.8),t0)
    if pos==2:put(bass(root-17,B*1.2,.8),t0)
    for i,n in enumerate(ch[:3]):put(pluck(n,.5,.7),t0+(0,B/2,B*.75)[i],1,(-.3,0,.3)[i])
    put(marimba(G['mel'][k%16],.45,1 if build else .7),t0,1,.2*(1 if k%2 else -1))
te=DUR-2.4;r0=G['prog'][0][1]
for i,n in enumerate(r0+[r0[1]+12]):put(marimba(n,2.3,1.2),te+i*.06)
put(bass(r0[0]-24,2.2),te);put(kick(1),te)
MUS*=np.minimum(1,np.arange(N)/(SR*.05))[:,None]
MUS/=max(1e-6,np.abs(MUS).max())/.7
wavfile.write(OUT,SR,(MUS*32767).astype(np.int16))
