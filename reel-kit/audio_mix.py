# Pecah VO per adegan + campur musik, VO, dan whoosh.
# python3 audio_mix.py split <vo.wav> <n>            -> cetak JSON [[mulai,selesai],...]
# python3 audio_mix.py mix <rencana.json> <out.wav>   (rencana: dur, musik, vo, potong[], cuts[])
import sys,json,subprocess,numpy as np
from scipy.io import wavfile
from scipy.signal import butter,sosfilt
SR=44100
def load(p):
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',p,'-ac','1','-ar',str(SR),'/tmp/_vo.wav'],check=True)
    _,x=wavfile.read('/tmp/_vo.wav');return x.astype(np.float32)/32768
def split(p,n):
    x=load(p);fr=int(.02*SR);m=len(x)//fr;e=np.array([np.sqrt(np.mean(x[i*fr:(i+1)*fr]**2)+1e-12) for i in range(m)])
    thr=max(20*np.log10(e.max())-38,-50);sil=20*np.log10(e)<thr;nz=np.where(~sil)[0];a,b=nz[0],nz[-1]+1
    gaps=[];i=a
    while i<b:
        if sil[i]:
            j=i
            while j<b and sil[j]:j+=1
            gaps.append((j-i,i,j));i=j
        else:i+=1
    gaps=sorted(sorted(gaps,reverse=True)[:n-1],key=lambda g:g[1])
    segs=[];s=a
    for _,i,j in gaps:segs.append([s*.02,i*.02]);s=j
    segs.append([s*.02,b*.02]);return [[round(p-.04,2),round(q+.06,2)] for p,q in segs],len(gaps)+1
def whoosh(d=.45):
    rng=np.random.default_rng(1);t=np.arange(int(d*SR))/SR;n=rng.standard_normal(len(t));o=np.zeros(len(t));seg=512
    for i in range(0,len(t),seg):
        p=i/len(t);fc=400+4500*p;o[i:i+seg]=sosfilt(butter(2,[fc*.7,min(fc*1.4,18000)],'band',fs=SR,output='sos'),n[i:i+seg])
    return o*np.sin(np.pi*t/d)**2*.25
if sys.argv[1]=='split':
    segs,k=split(sys.argv[2],int(sys.argv[3]));print(json.dumps({'segs':segs,'n':k}))
else:
    R=json.load(open(sys.argv[2]));N=int(R['dur']*SR)
    _,m=wavfile.read(R['musik']);m=m.astype(np.float32)/32768;mm=np.zeros((N,2));mm[:min(N,len(m))]=m[:N]
    duck=np.ones(N);vo=np.zeros(N)
    if R.get('vo'):
        x=load(R['vo'])
        for (s,e),t0 in R['potong']:
            seg=x[int(s*SR):int(e*SR)];i=int(t0*SR);seg=seg[:max(0,N-i)];vo[i:i+len(seg)]+=seg;duck[i:i+len(seg)]=.4
        k=int(.2*SR);duck=np.convolve(duck,np.ones(k)/k,'same')
        vo/=max(1e-6,np.abs(vo).max())/.8
    out=mm*(.6 if R.get('vo') else .9)*duck[:,None]+vo[:,None]
    w=whoosh()
    for c in R.get('cuts',[]):
        i=int((c-.3)*SR)
        if 0<=i<N-len(w):out[i:i+len(w)]+=w[:,None]*np.array([.8,1.0])
    fade=int(.6*SR);out[-fade:]*=np.linspace(1,0,fade)[:,None]
    out/=max(1e-6,np.abs(out).max())/.89
    wavfile.write(sys.argv[3],SR,(out*32767).astype(np.int16))
