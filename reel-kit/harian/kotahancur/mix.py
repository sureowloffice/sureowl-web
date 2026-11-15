import numpy as np, json
from scipy.io import wavfile
sr=44100;tl=json.load(open('tl.json'));S={n:(a,b) for n,a,b in tl['S']};TOT=tl['TOT'];N=int(TOT*sr);rng=np.random.default_rng(3)
def ld(p):
    r,m=wavfile.read(p);m=m.astype(np.float32)
    if m.ndim>1:m=m.mean(1)
    return m/(np.abs(m).max()+1e-9)
m1=ld('m1.wav');m2=ld('m2.wav');r,vo=wavfile.read('vo.wav');vo=vo.astype(np.float32)/32768;vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
mus=np.zeros(N)
def lay(m,a,b,g,fi=.3,fo=.4):
    i,j=int(a*sr),min(N,int(b*sr));seg=m[:j-i].copy();n=len(seg);env=np.ones(n);k=int(fi*sr);env[:k]=np.linspace(0,1,k);k=int(fo*sr);env[-k:]*=np.linspace(1,0,k);mus[i:i+n]+=seg*env*g
ga=S['h0-goyang'][0];lay(m1,0,ga+.3,.22,.05,.5)
ns=S['h0-nol'][0];lay(m2,ns-.2,TOT,.24,1.2,.9)
fx=np.zeros(N)
def put(s,t,g=1):
    i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:fx[i:j]+=s[:j-i]*g
def T(d):return np.arange(int(d*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
def rumble(d):t=T(d);n=lp(rng.standard_normal(len(t)),220);n/=np.abs(n).max();return n*(np.minimum(1,t/.6))*np.minimum(1,(d-t)/.8)*(.8+.2*np.sin(2*np.pi*7*t))
def crash(d=1.1,f=70):t=T(d);n=lp(rng.standard_normal(len(t)),18);n/=np.abs(n).max();b=np.sin(2*np.pi*np.cumsum(f+60*np.exp(-t*12))/sr);return (n*.7*np.exp(-t*4)+b*np.exp(-t*5))
def pop(f=900):t=T(.12);return np.sin(2*np.pi*np.cumsum(f*(1+2*np.exp(-t*40)))/sr)*np.exp(-t*30)*.5
def whoosh(d=.3):t=T(d);n=lp(rng.standard_normal(len(t)),8);return n*np.sin(np.pi*t/d)**2*.3
def wind(d):t=T(d);n=lp(rng.standard_normal(len(t)),90);n/=np.abs(n).max();return n*np.minimum(1,t/1)*np.minimum(1,(d-t)/1)
def ding(f=1568):t=T(.7);return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*2.01*t))*np.exp(-t*5)*.3
ru,bi,ko=S['h0-runtuh'],S['h0-bioskop'],S['h0-kosong']
put(rumble(bi[1]-ga+.2),ga+.4,.9)
for k,t in enumerate(np.linspace(ru[0]+.3,ru[1]-.2,9)):put(crash(1.0,60+rng.integers(0,40)),t+rng.uniform(-.1,.1),.55+.05*k)
put(crash(1.8,45),bi[0]+1.5,1.2)
put(wind(S['h0-sendiri'][1]-ko[0]),ko[0],.35)
for n in S:put(whoosh(),S[n][0]-.12,.6)
put(crash(.5,90),0.05,.5);put(pop(),.1)
for n in ['h0-bangga','h0-goyang','h0-sendiri','h0-cta']:put(pop(),S[n][0]+.25)
put(pop(),S['h0-nol'][0]+1.9);put(ding(),S['h0-cta'][0]+.15,.8);put(ding(2093),S['h0-papan'][0]+.25,.9);put(pop(700),S['h0-papan'][0]+1.6)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.5*np.clip(ev*10,0,1)
mix=mus*duck+vo*1.0+fx*.42*(1-.25*np.clip(ev*10,0,1));mix=mix/np.abs(mix).max()*.95
wavfile.write('mix.wav',sr,(mix*32767).astype(np.int16));print('ok',TOT)
