import sys,json,numpy as np
sys.path.insert(0,'/home/claude/score')
from sf2 import Synth,SR
from cues import make_score
from scipy.io import wavfile
sr=SR;rng=np.random.default_rng(5)
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};TOT=d['TOT'];N=int((TOT+.3)*sr)
TV=dict(zip(['L03','L05','L06','L07','L09','L10','L12a','L12b','L12c','L13','L14','L15','L16','L17','L18'],d['T']))
r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768;vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
A=lambda n:S[n][0];B=lambda n:S[n][1]
win=TV['L07'][1]-.75
sheet=[(0,A('b03-roti')+.5,'komedi'),(A('b03-roti')+.55,B('b03-roti'),'hit'),(A('b05-nambah'),B('b05-nambah'),'ceria'),(A('b06-buruk'),TV['L06'][0]+.9,'ceria'),(TV['L06'][0]+.95,B('b06-buruk'),'diam'),
 (A('b07-vote'),win-.05,'tegang'),(win,B('b07-vote'),'hit'),(A('b09-bukit'),B('b09-gerobak'),'komedi'),(A('b10-kerja'),B('b10-jempol'),'kerja'),(A('b12-kepsek'),B('b12-catat'),'komedi'),
 (A('b13-jadi'),B('b13-jadi'),'heroik'),(A('b14-kunci'),B('b14-kunci'),'haru'),(A('b15-saklar'),B('b15-saklar'),'diam'),(A('b16-gelap'),B('b16-gelap'),'sedih'),(A('b17-ab'),B('b17-ab'),'ceria'),(A('b18-jejak'),TOT,'misteri')]
syn=Synth('/home/claude/score/GeneralUser-GS.sf2')
mus=make_score(sheet,TOT+.3,syn,key=62).mean(1);mus=np.pad(mus,(0,max(0,N-len(mus))))[:N]
def T(d):return np.arange(int(d*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
def norm(a):return a/(np.abs(a).max()+1e-9)
fx=np.zeros(N)
def put(s,t,g=1):
    i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:fx[i:j]+=s[:j-i]*g
def swoosh(d=.38):t=T(d);n=rng.standard_normal(len(t));a=lp(n,30);b=lp(n,4);w=np.clip(t/d,0,1);return norm(a*(1-w)+b*w)*np.sin(np.pi*t/d)**1.5
def dun():
    out=np.zeros(int(1.5*sr))
    for k,(f,dd) in enumerate([(98,.25),(92,.25),(73,.8)]):
        t=T(dd);w=(np.sign(np.sin(2*np.pi*f*t))*.4+np.sin(2*np.pi*f*t))*np.exp(-t*2.5);i=int([0,.28,.56][k]*sr);out[i:i+len(w)]+=w
    return out*.6
def click():t=T(.05);return np.sin(2*np.pi*2400*t)*np.exp(-t*160)+lp(rng.standard_normal(len(t)),2)*np.exp(-t*200)*.5
def thud():t=T(.25);return np.sin(2*np.pi*(120-200*t)*t)*np.exp(-t*18)
def boing():t=T(.6);return np.sin(2*np.pi*np.cumsum(300+250*np.sin(2*np.pi*7*t)*np.exp(-t*3))/sr)*np.exp(-t*4)*.6
def pop():t=T(.08);return lp(rng.standard_normal(len(t)),3)*np.exp(-t*60)
def steps(d):
    s=np.zeros(int(d*sr))
    for k in np.arange(0,d-.05,.11):i=int(k*sr);n=int(.03*sr);s[i:i+n]+=lp(rng.standard_normal(n),5)*np.exp(-np.arange(n)/sr*120)
    return norm(s)*.4
def scratchs():
    t=T(.5);f=900+1400*np.sin(2*np.pi*2.2*t)**2;return np.sin(2*np.pi*np.cumsum(f)/sr)*.5+norm(lp(rng.standard_normal(len(t)),2))*.3*np.exp(-t*4)
def crowd(d):t=T(d);return lp(rng.standard_normal(len(t)),40)*(1+.3*np.sin(2*np.pi*1.3*t))*.5
def wind(d):t=T(d);return lp(rng.standard_normal(len(t)),120)*.6
def hoot():
    out=np.zeros(int(1.1*sr))
    for st,dd in [(0,.25),(.4,.55)]:
        t=T(dd);w=np.sin(2*np.pi*(380+8*np.sin(2*np.pi*6*t))*t)*np.sin(np.pi*t/dd)**2;i=int(st*sr);out[i:i+len(w)]+=w
    return out*.5
for n,(a,b) in S.items():
    if a>0:put(swoosh(),a-.25,.4)
put(dun(),A('b03-roti')+.55,.7);put(steps(2.6),A('b05-nambah'),.5);put(crowd(2.8),A('b05-nambah'),.25)
put(scratchs(),TV['L06'][0]+.9,.6);put(crowd(4),A('b07-vote'),.2);put(dun(),win,.8)
put(steps(1.4),A('b09-gerobak'),.5);put(thud(),A('b09-gerobak')+1.95,.8);put(steps(.5),A('b09-gerobak')+1.95,.6)
for k in np.arange(0,B('b10-jempol')-A('b10-kerja'),.32):put(thud(),A('b10-kerja')+k,.25)
put(boing(),A('b10-jempol')+.25,.7);put(crowd(6),A('b12-wapres'),.3)
for k in range(30):put(pop(),A('b13-jadi')+.3+k*.04,.3)
for k in range(3):put(click(),A('b15-saklar')+.25+k*.4,.9)
put(wind(B('b16-gelap')-A('b16-gelap')),A('b16-gelap'),.25)
put(hoot(),A('b18-jejak')+1.4,.3)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mus=mus/(np.abs(mus).max()+1e-9)
mix=mus*.32*duck+fx*.45*duck+vo
for a,b,m in sheet:
    if m=='diam':
        i,j=int(a*sr),int(b*sr);
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok')
