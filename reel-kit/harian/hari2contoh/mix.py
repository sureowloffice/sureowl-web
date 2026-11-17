import sys,json,numpy as np
sys.path.insert(0,'/home/claude/score')
from sf2 import Synth,SR
from cues import make_score
from scipy.io import wavfile
sr=SR;rng=np.random.default_rng(3)
tl=json.load(open('tl.json'));S={r[0]:(r[1],r[2]) for r in tl['S']};TOT=tl['TOT'];N=int((TOT+.3)*sr)
r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768;vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
syn=Synth('/home/claude/score/GeneralUser-GS.sf2')
r0=S['s2-roti'][0]
sheet=[(0,r0+.5,'komedi'),(r0+.5,S['s2-roti'][1],'hit'),(S['s2-cctv'][0],TOT,'misteri')]
mus=make_score(sheet,TOT+.3,syn,key=62).mean(1);mus=np.pad(mus,(0,max(0,N-len(mus))))[:N]
def T(d):return np.arange(int(d*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
def norm(a):return a/(np.abs(a).max()+1e-9)
fx=np.zeros(N)
def put(s,t,g=1):
    i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:fx[i:j]+=s[:j-i]*g
def swoosh(d=.38):t=T(d);n=rng.standard_normal(len(t));a=lp(n,30);b=lp(n,4);w=np.clip(t/d,0,1);return norm(a*(1-w)+b*w)*np.sin(np.pi*t/d)**1.5
def crack():
    s=np.zeros(int(.35*sr))
    for k in range(9):i=int(rng.uniform(0,.25)*sr);n=int(.012*sr);s[i:i+n]+=rng.standard_normal(n)*np.exp(-np.arange(n)/sr*400)
    return norm(s)
def snore(d):t=T(d);env=np.clip(np.sin(2*np.pi*.45*t),0,1)**2;return lp(rng.standard_normal(len(t)),18)*env*(1+.5*np.sin(2*np.pi*28*t))*.6
def dun():
    out=np.zeros(int(1.5*sr))
    for k,(f,dd) in enumerate([(98,.25),(92,.25),(73,.8)]):
        t=T(dd);w=(np.sign(np.sin(2*np.pi*f*t))*.4+np.sin(2*np.pi*f*t))*np.exp(-t*2.5);i=int([0,.28,.56][k]*sr);out[i:i+len(w)]+=w
    return out*.6
def hiss(d):return lp(rng.standard_normal(int(d*sr)),2)*.25
def steps(d):
    s=np.zeros(int(d*sr))
    for k in np.arange(0,d-.05,.09):i=int(k*sr);n=int(.03*sr);s[i:i+n]+=lp(rng.standard_normal(n),5)*np.exp(-np.arange(n)/sr*120)
    return norm(s)*.4
def hoot():
    out=np.zeros(int(1.1*sr))
    for st,d in [(0,.25),(.4,.55)]:
        t=T(d);w=np.sin(2*np.pi*(380+8*np.sin(2*np.pi*6*t))*t)*np.sin(np.pi*t/d)**2;i=int(st*sr);out[i:i+len(w)]+=w
    return out*.5
for n in ['s2-krek','s2-roti','s2-cctv','s2-jejak']:put(swoosh(),S[n][0]-.25,.45)
put(snore(S['split'][1]),0,.18)
put(crack(),S['s2-krek'][0]+.35,.7)
put(dun(),r0+.8,.55)
a,b=S['s2-cctv'];put(hiss(b-a),a,.35);put(steps(1.8),a+.3,.5)
a,b=S['s2-jejak'];put(hoot(),a+1.4,.35)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mus=mus/(np.abs(mus).max()+1e-9)
mix=mus*.32*duck+fx*.45*duck+vo
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok')
