import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
K=['V2','V3','V5','V6','V7'];V={k:load('vo/s_%s.wav'%k) for k in K};d=lambda k:len(V[k])/SR
def bigp(k,n):  # n jeda terpanjang, urut waktu -> [(mulai,selesai)]
    P=[(a,b) for a,b in pauses(V[k])];P=sorted(P,key=lambda p:p[1],reverse=True)[:n];return sorted(P)
T={};S=[];SEG=[]
S.append(['q0-hook',0]);q2=2.8;S.append(['q2-bangun',q2]);T['V2']=(q2+.15,q2+.15+d('V2'))
p=bigp('V2',2)[0];bangun=round(.15+p[0]+p[1]-.05,3);snap1=.9
q3=round(T['V2'][1]+.3,3)
cuts=[(a,a+b) for a,b in bigp('V3',3)];segs=[(0,(cuts[0][0]+cuts[0][1])/2),((cuts[0][0]+cuts[0][1])/2,(cuts[1][0]+cuts[1][1])/2),((cuts[1][0]+cuts[1][1])/2,(cuts[2][0]+cuts[2][1])/2),((cuts[2][0]+cuts[2][1])/2,d('V3'))]
MN=[1.9,1.9,1.7,2.6];names=['q3a-gali','q3b-tiang','q3c-atap','q3d-mural'];t0=q3;D={}
for k,(a,b) in enumerate(segs):
    S.append([names[k],round(t0,3)]);SEG.append([round(t0+.1,3),a,b]);dur=max(MN[k],(b-a)+.3);D[names[k]]=round(dur,3);t0+=dur
qj=round(t0,3);S.append(['q3e-janji',qj])
q5=round(qj+2.2,3);S.append(['q5-tidur',q5]);T['V5']=(q5+.6,q5+.6+d('V5'))
q6b=round(T['V5'][1]+1.5,3);S.append(['q6b-kuas',q6b]);snap6=.9;T['V6']=(q6b+snap6+.1,q6b+snap6+.1+d('V6'))
q7=round(T['V6'][1]+.3,3);S.append(['q7-cta',q7]);T['V7']=(q7+.2,q7+.2+d('V7'))
TOT=round(T['V7'][1]+.6,2)
T['V3']=(SEG[0][0],SEG[-1][0]+segs[-1][1]-segs[-1][0])
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
for n,a,b in S:D[n]=round(b-a,3)
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:
    if k=='V3':continue
    a=int(T[k][0]*SR);out[a:a+len(V[k])]+=V[k]
for st,a,b in SEG:x=V['V3'][int(a*SR):int(b*SR)];i=int(st*SR);out[i:i+len(x)]+=x
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['q2-bangun','q5-tidur','q6b-kuas','q7-cta']
for n,a,b in S:
    if n in PRES:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
KF={'snap1':snap1,'bangun':bangun,'snap6':snap6,'D':D}
json.dump({'T':T,'TOT':TOT,'S':S,'KF':KF,'SEG':SEG,'segs':segs},open('tl.json','w'));json.dump(KF,open('/home/claude/sureowl-web/reel-kit/data/h5_kf.json','w'))
print(TOT,KF);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h5/c/%s.mp4 >/tmp/claude-0/h5/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
