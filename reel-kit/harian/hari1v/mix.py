import numpy as np, json
from scipy.io import wavfile
sr=44100;rng=np.random.default_rng(5)
tl=json.load(open('tl.json'));S={r[0]:(r[1],r[2]) for r in tl['S']};TOT=tl['TOT'];N=int((TOT+.3)*sr)
def ld(p):
    r,m=wavfile.read(p);m=m.astype(np.float32)
    if m.ndim>1:m=m.mean(1)
    return m/(np.abs(m).max()+1e-9)
vo=ld('vo.wav')*.92;vo=np.pad(vo,(0,max(0,N-len(vo))))[:N]
mu=ld('/home/claude/k3/m1.wav');mu=np.tile(mu,int(np.ceil(N/len(mu))))[:N]
def T(d):return np.arange(int(d*sr))/sr
def lp(n,k):return np.convolve(n,np.ones(k)/k,'same')
fx=np.zeros(N);amb=np.zeros(N)
def put(s,t,g=1,buf=None):
    b=fx if buf is None else buf;i=max(0,int(t*sr));j=min(N,i+len(s))
    if i<N:b[i:j]+=s[:j-i]*g
def norm(a):return a/(np.abs(a).max()+1e-9)
def swoosh(d=.38):t=T(d);n=rng.standard_normal(len(t));a=lp(n,30);b=lp(n,4);w=np.clip(t/d,0,1);return norm(a*(1-w)+b*w)*np.sin(np.pi*t/d)**1.5
def boom(d=1.4):t=T(d);f=55+70*np.exp(-t*9);return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t*2.6)+norm(lp(rng.standard_normal(len(t)),12))*np.exp(-t*14)*.5
def sting():t=T(.9);f=np.linspace(1200,300,len(t));return (np.sign(np.sin(2*np.pi*np.cumsum(f)/sr))*.25+np.sin(2*np.pi*np.cumsum(f*.5)/sr))*np.exp(-t*4)*.6
def murmur(d):
    t=T(d);s=np.zeros(len(t))
    for k in range(9):
        f0=110+rng.uniform(0,120);am=np.clip(np.sin(2*np.pi*rng.uniform(2,5)*t+rng.uniform(0,6)),0,1)**2;s+=np.sin(2*np.pi*np.cumsum(f0*(1+.08*np.sin(2*np.pi*rng.uniform(3,7)*t)))/sr)*am
    s=lp(s,6)+lp(rng.standard_normal(len(t)),40)*.6;return norm(s)*np.minimum(1,t/.3)*np.minimum(1,(d-t)/.3)
def hammer():t=T(.25);return (norm(lp(rng.standard_normal(len(t)),3))*np.exp(-t*40)+np.sin(2*np.pi*180*t)*np.exp(-t*25))*.8
def tick(f=2400):t=T(.05);return np.sin(2*np.pi*f*t)*np.exp(-t*90)
def bird():t=T(.18);f=3200+900*np.sin(2*np.pi*14*t);return np.sin(2*np.pi*np.cumsum(f)/sr)*np.sin(np.pi*t/.18)*.4
def cheer(d):return murmur(d)*.7+norm(lp(rng.standard_normal(len(T(d))),5))*.5*np.minimum(1,T(d)/.2)*np.minimum(1,(d-T(d))/.6)
def popc():t=T(.06);return norm(rng.standard_normal(len(t)))*np.exp(-t*80)
def cricket(d):
    t=T(d);env=(np.sin(2*np.pi*14*t)>0.3)*(np.sin(2*np.pi*.9*t)>-.2);return np.sin(2*np.pi*4400*t)*env*.5
def clap(d):
    s=np.zeros(int(d*sr))
    for k in range(int(d*14)):i=int(rng.uniform(0,d-.05)*sr);n=int(.03*sr);s[i:i+n]+=rng.standard_normal(n)*np.exp(-np.arange(n)/sr*120)
    return s*.6
def sadtrombone():
    out=[]
    for f,d in [(392,.35),(370,.35),(349,.35),(330,.9)]:
        t=T(d);w=np.sin(2*np.pi*f*t*(1+.01*np.sin(2*np.pi*6*t)))+.4*np.sin(4*np.pi*f*t);out.append(w*np.minimum(1,t/.03)*np.minimum(1,(d-t)/.08))
    return np.concatenate(out)*.5
def scratch():t=T(.45);f=600+900*np.sin(2*np.pi*3*t)**2;return np.sin(2*np.pi*np.cumsum(f)/sr)*.4+norm(lp(rng.standard_normal(len(t)),2))*.3*np.exp(-t*4)
def ding():t=T(.8);return (np.sin(2*np.pi*1320*t)+.5*np.sin(2*np.pi*1980*t))*np.exp(-t*5)*.6
def steps(d):
    s=np.zeros(int(d*sr))
    for k in np.arange(0,d-.05,.11):i=int(k*sr);n=int(.04*sr);s[i:i+n]+=lp(rng.standard_normal(n),6)*np.exp(-np.arange(n)/sr*90)
    return norm(s)*.5
names=[r[0] for r in tl['S']]
for n in names[1:]:put(swoosh(),S[n][0]-.25,.5)
put(boom(),.02,.9);put(sting(),.05,.5)
a,b=S['ck3-bahu'];put(murmur(b-a),a,.15);m=a+(b-a)*.62
for k in range(24):put(tick(2000+k*30),m+k*.9/24,.3)
put(boom(.8),m+.92,.4)
a,b=S['h1-lama'];put(boom(1.6)*.6,a,.4)
a,b=S['h1-ribut'];put(murmur(b-a),a,.4)
a,b=S['h1-aku'];put(cricket(b-a),a,.25)
a,b=S['h1-bos'];put(murmur(b-a),a,.15)
for k,o in enumerate([.2,1.6,3.0,4.4]):put(popc(),a+o,.5);put(ding()[:int(.3*sr)],a+o,.25)
a,b=S['h1-adil']
for k in np.arange(a+.2,b,.6):
    for o,amp in [(0,1),(.16,.7)]:q=int((k+o)*sr);n=int(.15*sr);x_=np.arange(n)/sr;fx[q:q+n]+=np.sin(2*np.pi*60*x_)*np.exp(-x_*30)*amp*.8
a,b=S['h1-seri'];put(sadtrombone(),a+.5,.45)
a,b=S['h1-roti'];put(boom(),a+2.15,.9);put(sting(),a+2.15,.4)
a,b=S['h1-janji'];put(boom(1.2),a+.1,.6)
a,b=S['h1-malam']
for t in np.arange(a+.2,b-.1,.28):put(hammer(),t+rng.uniform(-.03,.03),.4)
put(cricket(b-a),a,.12)
a,b=S['h1-pagi']
for t in [a+.1,a+.4,a+.9]:put(bird(),t,.5)
put(boom(1.2),a+1.2,.8);put(cheer(b-a-1.1),a+1.15,.5)
for k in range(14):put(popc(),a+1.2+rng.uniform(0,.7),.3)
a,b=S['h1-antre'];put(scratch(),a+.05,.55)
a,b=S['h1-kasih'];put(clap(b-a),a+.4,.35)
a,b=S['h1-tidur'];put(cricket(b-a),a,.25)
a,b=S['h1-ab'];put(popc(),a+.3,.6);put(popc(),a+1.3,.6)
a,b=S['h1-hilang'];put(steps(.6),a+1.0,.5);put(sting(),a+1.0,.3)
a,b=S['h1-akhir'];put(boom(1.6),a+.1,.7)
P=json.load(open('fx.json'))
def boing():t=T(.5);f=180+120*np.sin(2*np.pi*9*t)*np.exp(-t*4);return np.sin(2*np.pi*np.cumsum(f)/sr)*np.exp(-t*3)*.7
def chew(d):
    s=np.zeros(int(d*sr))
    for k in np.arange(0,d-.1,.22):i=int(k*sr);n=int(.09*sr);s[i:i+n]+=lp(rng.standard_normal(n),3)*np.exp(-np.arange(n)/sr*40)
    return norm(s)*.6
def dun():
    out=np.zeros(int(1.5*sr))
    for k,(f,dd) in enumerate([(98,.25),(92,.25),(73,.8)]):
        t=T(dd);w=(np.sign(np.sin(2*np.pi*f*t))*.4+np.sin(2*np.pi*f*t))*np.exp(-t*2.5);i=int([0,.28,.56][k]*sr);out[i:i+len(w)]+=w
    return out*.6
for n,t,d in P['cuts']:put(swoosh(.25),t-.12,.35)
for t in P['punch']:put(swoosh(.2),t-.05,.25)
for t,d in P['freeze']:put(dun(),t,.55)
jm=[c for c in P['cuts'] if c[0]=='h1-jempol'][0];put(boing(),jm[1]+.15,.6);put(hammer(),jm[1]+.05,.6)
a,b=S['h1-adil'];put(ding(),a+(b-a)*.8,.45)
a,b=S['h1-kasih'];put(chew(1.2),a+1.6,.4)
# musik: naik turun
g=np.full(N,.22)
def seg(n,v):i,j=int(S[n][0]*sr),int(S[n][1]*sr);g[i:j]=v
for n,v in [('h1-lama',0),('h1-haru',.12),('h1-ribut',.14),('h1-aku',0),('h1-adil',.1),('h1-seri',0),('h1-roti',.06),('h1-janji',.3),('h1-malam',.12),('h1-pagi',.3),('h1-antre',0),('h1-kasih',.16),('h1-tidur',.08),('h1-hilang',0),('h1-akhir',.18)]:seg(n,v)
g=lp(g,int(.15*sr))
# dengung tegang saat ribut/adil/hilang
ten=np.zeros(N)
for n in ['h1-ribut','h1-adil','h1-hilang','h1-lama']:
    a,b=S[n];i,j=int(a*sr),int(b*sr);tt=np.arange(j-i)/sr;ten[i:j]+=(np.sin(2*np.pi*55*tt)*.5+np.sin(2*np.pi*58.3*tt)*.4)*np.minimum(1,tt/.4)*np.minimum(1,(b-a-tt)/.3)
ev=np.convolve(np.abs(vo),np.ones(2205)/2205,'same');duck=1-.55*np.clip(ev*10,0,1)
mix=mu*g*duck+ten*.12+fx*.45*duck+vo
wavfile.write('mix.wav',sr,(mix/np.abs(mix).max()*.92*32767).astype(np.int16));print('ok',round(N/sr,2))
