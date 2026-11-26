import sys,json,numpy as np
sys.path.insert(0,'/home/claude/score')
from sf2 import Synth,SR
from cues import make_score
from scipy.io import wavfile
sr=SR;rng=np.random.default_rng(11)
d=json.load(open('tl.json'));S={n:(a,b) for n,a,b in d['S']};TOT=d['TOT'];N=int((TOT+.3)*sr);T=d['T'];EV=d['EV']
r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768
if r!=sr:
    import subprocess;subprocess.run(['ffmpeg','-y','-loglevel','error','-i','vo.wav','-ar',str(sr),'vo_sr.wav'],check=True);r,vo=wavfile.read('vo_sr.wav');vo=vo.astype(np.float32)/32768
vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
A=lambda n:S[n][0];B=lambda n:S[n][1];FX=json.load(open('fx.json'))
sheet=[(.1,A('h2-lahan')-.05,'diam'),(A('h2-lahan'),A('h5a-gebuk')-.05,'kerja'),(A('h5a-gebuk'),A('h6-peredam')-.05,'diam'),(A('h6-peredam'),A('h10a-malam')-.05,'komedi'),(A('h10a-malam'),A('h11-vote')-.05,'misteri'),(A('h11-vote'),A('h14a-rekap')-.05,'ceria'),(A('h14a-rekap'),TOT,'heroik')]
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
def clang():t=TT(1.0);return sum(np.sin(2*np.pi*f*t)*np.exp(-t*k) for f,k in [(523,4),(1340,6),(2210,8),(3100,10)])*.35
def splash():t=TT(.6);return lp(rng.standard_normal(len(t)),6)*np.exp(-t*6)*1.2
def scratch(dd):
    s=np.zeros(int(dd*sr))
    for k in np.arange(0,dd-.1,.16):n=int(.12*sr);i=int(k*sr);s[i:i+n]+=lp(rng.standard_normal(n),2)*np.sin(np.pi*np.arange(n)/n)
    return s*.5
def brush():t=TT(.25);return lp(rng.standard_normal(len(t)),12)*np.sin(np.pi*t/.25)*.8
def creak(dd):t=TT(dd);return np.sign(np.sin(2*np.pi*np.cumsum(70+30*np.sin(t*3))/sr))*np.exp(-((t-dd/2)/(dd/2))**2)*.25
def clap(dd):
    s=np.zeros(int(dd*sr))
    for k in np.arange(0,dd-.05,.09):n=int(.02*sr);i=int((k+rng.random()*.03)*sr);s[i:i+n]+=rng.standard_normal(n)*.5
    return lp(s,3)
def tok(f0=520):t=TT(.35);return (np.sin(2*np.pi*f0*t)+.6*np.sin(2*np.pi*f0*2.7*t))*np.exp(-t*14)*.9+norm(lp(rng.standard_normal(len(t)),2))*np.exp(-t*80)*.4
def dig():t=TT(.3);return norm(lp(rng.standard_normal(len(t)),6))*np.exp(-t*12)*.9+np.sin(2*np.pi*(120-80*t)*t)*np.exp(-t*15)*.6
def snore(dd):t=TT(dd);return lp(rng.standard_normal(len(t)),30)*np.maximum(0,np.sin(2*np.pi*.6*t))**2*1.4
for n,(a,b) in S.items():
    if a>0 and n not in ('h1b-kaget','h10b-pulas'):put(swoosh(),a-.25,.35)
def tick():t=TT(.05);return np.sin(2*np.pi*2000*t)*np.exp(-t*80)*.4
def blip(f=1200):t=TT(.15);return np.sin(2*np.pi*f*t)*np.exp(-t*25)*.7
def buzz():t=TT(.6);return np.sign(np.sin(2*np.pi*180*t))*.25*(np.sin(2*np.pi*6*t)>0)

def kick():t=TT(.35);return np.sin(2*np.pi*(110*np.exp(-t*18)+45)*t)*np.exp(-t*9)*1.4
def snare():t=TT(.25);return norm(lp(rng.standard_normal(len(t)),2))*np.exp(-t*18)*.8+np.sin(2*np.pi*190*t)*np.exp(-t*25)*.5
def hat():t=TT(.06);return norm(rng.standard_normal(len(t)))*np.exp(-t*70)*.25
def cymb():t=TT(1.4);return norm(lp(rng.standard_normal(len(t)),1))*np.exp(-t*2.5)*.5
def drums(t0,t1,g=1,muf=1,bpm=150):
    seg=np.zeros(int((t1-t0)*sr)+sr);bt=60/bpm/2
    for i,k in enumerate(np.arange(0,t1-t0,bt)):
        j=int(k*sr)
        for snd in ([kick()] if i%4==0 else [snare()] if i%4==2 else [])+[hat()]:seg[j:j+len(snd)]+=snd[:len(seg)-j]
        if i%16==0:c=cymb();seg[j:j+len(c)]+=c[:len(seg)-j]*.8
    if muf>1:seg=lp(seg,muf)*1.6
    put(seg[:int((t1-t0)*sr)],t0,g)
put(drone(A('h1b-kaget')),0,.4);put(snore(EV['duar']),0,.9)
put(boom(),EV['duar'],1.2);put(crash(),EV['duar'],.9);drums(EV['duar'],A('h2-lahan'),.9)
put(pop(),EV['auzan']-.3,.7)
for k in np.arange(A('h4-bangun')+.4,B('h4-bangun')-.3,.32):put(tok(),k,.45)
drums(EV['gebuk']+.3,B('h5b-kota'),1.0);put(crash(),EV['kebangun'],.7);put(cheer(1.5),EV['kebangun']+.1,.4)
drums(A('h6-peredam'),EV['busa'],.7);drums(EV['busa'],EV['stgh'],.55,8);drums(EV['stgh'],B('h8-warga'),.45,25)
for k in np.arange(EV['busa'],EV['karpet'],.25):put(tick(),k,.5)
put(splash(),EV['air'],.5);put(stampS(),EV['karet']+.3,.5);put(stampS(),EV['vent']+.3,.5)
put(stampS(),EV['pasang']+.3,.6)
put(cricket(B('h10b-pulas')-A('h10a-malam')),A('h10a-malam'),.7);drums(A('h10a-malam'),B('h10b-pulas'),.18,40);put(snore(B('h10b-pulas')-A('h10b-pulas')),A('h10b-pulas'),.8)
put(stampS(),EV['hasil'],.8);put(cheer(2.0),EV['hasil']+.1,.6);put(pop(),EV['makasih'],.6)
put(clap(2.0),EV['resmi']+.6,.6);put(fanfare(),EV['resmi']+.6,.5)
put(pop(),EV['A']-.2,.8);put(pop(),EV['B']-.2,.8);put(stampS(),EV['komenab'],.6)
for k in ['b_roti','b_bukit','b_tiang','b_papan','b_pos','b_cctv','b_band']:put(ting(),EV[k],.6)
put(pop(),EV['polisi'],.6);put(stampS(),EV['inget'],.7);put(pop(),EV['komen'],.8);put(pop(),EV['like'],.8);put(stampS(),EV['follow'],.7);put(cheer(2.5),EV['follow']+.2,.5)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mus=mus/(np.abs(mus).max()+1e-9)
# musik senyap total saat JEGLEK 1 dtk
g=np.ones(N)
g[int(A('h5a-gebuk')*sr):int(B('h5b-kota')*sr)]=.35
mix=mus*.3*duck*g+fx*.5*np.maximum(duck,.75)+vo
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok')
