import sys,json,numpy as np
sys.path.insert(0,'/home/claude/score')
from sf2 import Synth,SR
from cues import make_score
from scipy.io import wavfile
sr=SR;rng=np.random.default_rng(7)
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};TOT=d['TOT'];N=int((TOT+.3)*sr);T=d['T']
r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768;vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
A=lambda n:S[n][0];B=lambda n:S[n][1];c4=A('c4-muter');lah=S['c6-lah'][1]-.55
sheet=[(0,A('c3-peluit'),'komedi'),(A('c3-peluit'),c4,'tegang'),(c4,c4+3.08,'kerja'),(c4+3.1,c4+3.38,'diam'),(c4+3.4,A('c5-menang'),'hit'),(A('c5-menang'),B('c5-menang'),'heroik'),(A('c6-lah'),lah,'komedi'),(lah,lah+.5,'diam'),(A('c7-cta'),TOT,'ceria')]
syn=Synth('/home/claude/score/GeneralUser-GS.sf2')
mus=make_score(sheet,TOT+.3,syn,key=64).mean(1);mus=np.pad(mus,(0,max(0,N-len(mus))))[:N]
def TT(dd):return np.arange(int(dd*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
def norm(a):return a/(np.abs(a).max()+1e-9)
fx=np.zeros(N)
def put(s,t,g=1):
    i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:fx[i:j]+=s[:j-i]*g
def swoosh(dd=.38):t=TT(dd);n=rng.standard_normal(len(t));a=lp(n,30);b=lp(n,4);w=np.clip(t/dd,0,1);return norm(a*(1-w)+b*w)*np.sin(np.pi*t/dd)**1.5
def whistle():t=TT(.9);f=2900+120*np.sign(np.sin(2*np.pi*28*t));return np.sin(2*np.pi*np.cumsum(f)/sr)*np.minimum(1,t*30)*np.minimum(1,(.9-t)*10)*.6
def thud():t=TT(.3);return np.sin(2*np.pi*(110-180*t)*t)*np.exp(-t*14)
def steps(dd):
    s=np.zeros(int(dd*sr))
    for k in np.arange(0,dd-.05,.1):i=int(k*sr);n=int(.03*sr);s[i:i+n]+=lp(rng.standard_normal(n),5)*np.exp(-np.arange(n)/sr*120)
    return norm(s)*.4
def crowd(dd):t=TT(dd);return lp(rng.standard_normal(len(t)),40)*(1+.3*np.sin(2*np.pi*1.3*t))*.5
def cheer(dd):t=TT(dd);return lp(rng.standard_normal(len(t)),8)*np.exp(-t*1.2)*.6
def boing():t=TT(.6);return np.sin(2*np.pi*np.cumsum(300+250*np.sin(2*np.pi*7*t)*np.exp(-t*3))/sr)*np.exp(-t*4)*.6
def dun():
    out=np.zeros(int(1.5*sr))
    for k,(f,dd) in enumerate([(98,.25),(92,.25),(73,.8)]):
        t=TT(dd);w=(np.sign(np.sin(2*np.pi*f*t))*.4+np.sin(2*np.pi*f*t))*np.exp(-t*2.5);i=int([0,.28,.56][k]*sr);out[i:i+len(w)]+=w
    return out*.6
for n,(a,b) in S.items():
    if a>0:put(swoosh(),a-.25,.4)
put(crowd(4),A('c2-komen'),.3);put(whistle(),T['2'][0]+.5,.7);put(steps(3.0),c4,.5)
for k in range(6):put(thud(),c4+3.4+k*.07,.6)
put(boing(),c4+3.7,.5);put(cheer(2.5),A('c5-menang')+.8,.5);put(dun(),lah,.7)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mus=mus/(np.abs(mus).max()+1e-9)
mix=mus*.32*duck+fx*.45*duck+vo
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok')
