import sys,json,numpy as np
sys.path.insert(0,'/home/claude/score')
from sf2 import Synth,SR
from cues import make_score
from scipy.io import wavfile
sr=SR;rng=np.random.default_rng(11)
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};TOT=d['TOT'];N=int((TOT+.3)*sr);T=d['T'];KF=d['KF']
r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768
if r!=sr:
    import subprocess;subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo.wav','-ar',str(sr),'vo_sr.wav'],check=True);r,vo=wavfile.read('vo_sr.wav');vo=vo.astype(np.float32)/32768
vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
A=lambda n:S[n][0];B=lambda n:S[n][1];FX=json.load(open('fx.json'))
zap=A('m2-setrum')+.32;jg=A('m3-gelap');helm=A('m4b-vanzz')+1.15;ila=A('m6a-tiang')+KF['snap6'];maaf=A('m5b-pres')+KF['maaf']
sheet=[(0,zap,'komedi'),(zap,jg,'hit'),(jg,jg+1.2,'diam'),(jg+1.2,B('m3-gelap'),'sedih'),(A('m4a-pres'),helm-.05,'komedi'),(helm,B('m4b-vanzz'),'heroik'),(A('m4c-beresin'),B('m5b-pres'),'komedi'),(B('m5b-pres'),B('m5c-noob'),'sedih'),(ila,ila+.4,'hit'),(ila+.4,B('m6b-bisik'),'misteri'),(A('m7a-cta'),B('m7a-cta'),'tegang'),(A('m7b-jubah'),TOT,'misteri')]
syn=Synth('/home/claude/score/GeneralUser-GS.sf2')
mus=make_score(sheet,TOT+.3,syn,key=62).mean(1);mus=np.pad(mus,(0,max(0,N-len(mus))))[:N]
def TT(dd):return np.arange(int(dd*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
def norm(a):return a/(np.abs(a).max()+1e-9)
fx=np.zeros(N)
def put(s,t,g=1):
    i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:fx[i:j]+=s[:j-i]*g
def swoosh(dd=.38):t=TT(dd);n=rng.standard_normal(len(t));a=lp(n,30);b=lp(n,4);w=np.clip(t/dd,0,1);return norm(a*(1-w)+b*w)*np.sin(np.pi*t/dd)**1.5
def crowd(dd):t=TT(dd);return lp(rng.standard_normal(len(t)),40)*(1+.4*np.sin(2*np.pi*1.7*t))*.6
def cheer(dd):t=TT(dd);return lp(rng.standard_normal(len(t)),8)*np.exp(-t*1.2)*.6
def crash(dd=1.8):t=TT(dd);n=rng.standard_normal(len(t));return (lp(n,2)*np.exp(-t*2.2)*.9+np.sin(2*np.pi*55*t)*np.exp(-t*5)*1.2)
def boom():t=TT(1.2);return np.sin(2*np.pi*(70-40*t)*t)*np.exp(-t*3)*1.4
def pop():t=TT(.12);return np.sin(2*np.pi*(900+2600*t)*t)*np.exp(-t*30)*.8+norm(lp(rng.standard_normal(len(t)),3))*np.exp(-t*60)*.3
def ting():t=TT(.5);return (np.sin(2*np.pi*1760*t)+.5*np.sin(2*np.pi*2640*t))*np.exp(-t*8)*.5
def buzz(dd):t=TT(dd);s=np.sign(np.sin(2*np.pi*120*t))*.5+np.sin(2*np.pi*240*t)*.3;s*=(.6+.4*(rng.random(len(t))>.5));return s*np.minimum(1,t*30)*np.exp(-t*1.5)*.7
def zapS():t=TT(.9);n=rng.standard_normal(len(t));c=(np.sin(2*np.pi*(1800+900*np.sin(2*np.pi*31*t))*t));return (c*.6+lp(n,2)*.8)*(rng.random(len(t))>.35)*np.exp(-t*2.2)
def powerdown():t=TT(1.1);return np.sin(2*np.pi*np.cumsum(420*np.exp(-t*3)+40)/sr)*np.exp(-t*2)*.7
def thunk():t=TT(.5);return np.sin(2*np.pi*(90-60*t)*t)*np.exp(-t*9)*1.4+norm(lp(rng.standard_normal(len(t)),3))*np.exp(-t*25)*.5
def cricket(dd):
    s=np.zeros(int(dd*sr))
    for k in np.arange(0,dd-.2,.45):t=TT(.16);c=np.sin(2*np.pi*4300*t)*(np.sin(2*np.pi*45*t)>0)*np.exp(-t*6);i=int(k*sr);s[i:i+len(c)]+=c
    return s*.35
def hum(dd):t=TT(dd);return (np.sin(2*np.pi*100*t)+.4*np.sin(2*np.pi*200*t))*np.minimum(1,t*4)*np.exp(-t*1.5)*.35
def fanfare():
    out=np.zeros(int(2.0*sr))
    for f0,st,dd in [(523,0,.18),(659,.18,.18),(784,.36,.18),(1047,.54,1.2)]:
        i=int(st*sr);tt=TT(dd);w=sum(np.sin(2*np.pi*f0*h*tt)/h for h in (1,2,3,4))*np.minimum(1,tt*40)*np.exp(-tt*1.2);out[i:i+len(w)]+=w
    return out*.35
def sadtrom():
    out=np.zeros(int(2.5*sr))
    for k,f0 in enumerate([392,370,349,311]):
        dd=.45 if k<3 else 1.0;tt=TT(dd);vib=1+.012*np.sin(2*np.pi*6*tt)*(k==3);w=sum(np.sin(2*np.pi*f0*vib*h*tt)/h**1.3 for h in (1,2,3,4,5))*np.minimum(1,tt*20)*np.exp(-tt*(1.5 if k<3 else 1));i=int(k*.45*sr);out[i:i+len(w)]+=w
    return out*.28
def stampS():t=TT(.25);return np.sin(2*np.pi*(160-200*t)*t)*np.exp(-t*20)*1.2+norm(lp(rng.standard_normal(len(t)),2))*np.exp(-t*40)*.4
def steps(dd,rate=.1):
    s=np.zeros(int(dd*sr))
    for k in np.arange(0,dd-.05,rate):i=int(k*sr);n=int(.03*sr);s[i:i+n]+=lp(rng.standard_normal(n),5)*np.exp(-np.arange(n)/sr*120)
    return norm(s)*.4
def drone(dd):t=TT(dd);return (np.sin(2*np.pi*55*t)+.5*np.sin(2*np.pi*82.5*t+np.sin(t)))*np.minimum(1,t*2)*np.minimum(1,(dd-t)*2)*.35
HC=[A('m3-gelap'),A('m6a-tiang'),A('m2-setrum')]
for n,(a,b) in S.items():
    if a>0 and not any(abs(a-h)<.01 for h in HC):put(swoosh(),a-.25,.35)
put(crowd(4.8),0,.45);put(buzz(1.6),A('m1-premis')+KF['jangan']-.4,.35)
put(stampS(),A('m1-premis')+KF['jangan'],.6)
put(zapS(),zap,1.0);put(buzz(1.0),zap,.6)
put(powerdown(),jg-.05,.8);put(thunk(),jg,1.0);put(boom(),jg+.03,.9);put(stampS(),jg+.05,.7);put(cricket(3.5),jg+.5,1.0)
put(thunk(),A('m4a-pres'),.7);put(hum(2.0),A('m4a-pres'),.6)
put(pop(),A('m4a-pres')+.35,.9);put(ting(),A('m4a-pres')+.37,.5)
put(steps(.9),A('m4b-vanzz')+.05,.5);put(pop(),helm,.9);put(stampS(),helm+.5,.7);put(fanfare(),helm,1.0);put(cheer(2.6),helm+.05,.9)
for k in range(4):put(pop(),A('m5a-papan')+.5+k*.28,.7)
put(stampS(),maaf,.7);put(sadtrom(),A('m5c-noob')-.1,.9)
put(crash(1.2),ila,.7);put(boom(),ila,.9);put(stampS(),ila,.6);put(drone(B('m6b-bisik')-ila),ila+.3,.8)
put(pop(),T['S5'][0]+.15,.9);put(pop(),T['S5'][0]+.6,.9);put(stampS(),T['S5'][0]+3.0,.6)
put(steps(2.6,.13),A('m7b-jubah')+.25,.6);put(drone(3.0),A('m7b-jubah'),.6);put(stampS(),A('m7b-jubah')+1.9,.7)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mus=mus/(np.abs(mus).max()+1e-9)
# musik senyap total saat JEGLEK 1 dtk
g=np.ones(N);i0=int(jg*sr);i1=int((jg+1.1)*sr);g[i0:i1]=0;g[i1:i1+int(.4*sr)]=np.linspace(0,1,min(int(.4*sr),N-i1))
mix=mus*.3*duck*g+fx*.5*np.maximum(duck,.75)+vo
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok')
