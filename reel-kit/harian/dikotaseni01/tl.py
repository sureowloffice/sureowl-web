import numpy as np,json,os
from scipy.io import wavfile
SR=24000
AL=json.load(open('/home/claude/ks1/al.json'))
AL['W'][0]=[0.64,1.16,'Kak…'];AL['W'][1]=[1.53,2.79,'yang dulu main di taman, ya?']
json.dump(AL,open('/home/claude/ks1/al2.json','w'),ensure_ascii=False)
def load(p):
    sr,x=wavfile.read(p);x=x.astype(np.float32)/32768
    assert sr==SR,sr
    return x if x.ndim==1 else x.mean(1)
V={k:load('/home/claude/ks1/vo2/%s.wav'%k) for k in ['B1','B2','W','B3']}
d=lambda k:len(V[k])/SR
CUT=5.0
T={'B1':0.4}
T['B2']=round(T['B1']+d('B1')+.4,3)
T['W']=round(T['B2']+d('B2')+1.0,3)
T['B3a']=round(T['W']+d('W')+.4,3)
T['B3b']=round(T['B3a']+CUT+4.0-AL['B3'][3][0]+ .0,3)  # offset so phrase3 starts after 4s gap
TOT=round(T['B3b']+d('B3')+1.2,2)
ph=lambda b,i:(T[b] if b!='B3b' else T['B3b'])+AL['B3' if b.startswith('B3') else b][i][0]
EV={}
for i,k in enumerate(['dks','kalau','alat','tiap','milih','begitu','muncul','selama','lepas']):EV[k]=ph('B1',i)
for i,k in enumerate(['gitar','sore','taman','nonton','tiga','capek','buat','peduli','seminggu','putus','sebulan','hilang','biasa','dengerin','rasanya']):EV[k]=ph('B2',i)
for i,k in enumerate(['kak','yangdulu','jendela','aku','garagara']):EV[k]=ph('W',i)
for i,k in enumerate(['tigaorang','salahsatu','mulai']):EV[k]=T['B3a']+AL['B3'][i][0]
for i,k in enumerate(['kalaukamu','senikamu','tulis','besok','bareng','kirim','follow','biar']):EV[k]=T['B3b']+AL['B3'][i+3][0]
EV['knock']=T['W']-.5;EV['balik']=T['B3a']+CUT+1.2
EV={k:round(v,3) for k,v in EV.items()}
S=[['s1-hook',0],['s2-datang',EV['tiap']-.2],['s3-lepas',EV['selama']-.25],['s4-taman',T['B2']-.15],['s5-capek',EV['capek']-.25],['s6-pudar',EV['seminggu']-.3],
   ['s7-biasa',EV['biasa']-.25],['s8-ketok',EV['knock']-.4],['s9-kilas',T['B3a']-.15],['s10-balik',T['B3a']+CUT-.1],['s11-cta',EV['kalaukamu']-.3]]
S=[[n,round(a,3)] for n,a in S]
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
A={n:a for n,a,b in S}
r=lambda k,shot:round(EV[k]-A[shot],3)
K={'pop1':r('muncul','s2-datang'),'pop2':r('muncul','s2-datang')+.5,'tiga':r('tiga','s4-taman'),'putus0':r('seminggu','s6-pudar'),'putus1':r('putus','s6-pudar')+.8,
 'hil0':r('sebulan','s6-pudar'),'hil1':r('hilang','s6-pudar')+.7,'biasa':r('biasa','s7-biasa')+.3,'knock':r('knock','s8-ketok'),'buka':r('knock','s8-ketok')+.35,'kak':r('kak','s8-ketok'),
 'ade':r('salahsatu','s9-kilas'),'balik':r('balik','s10-balik')}
out=np.zeros(int(TOT*SR)+SR,np.float32)
def put(x,t):i=int(t*SR);out[i:i+len(x)]+=x[:len(out)-i]
put(V['B1'],T['B1']);put(V['B2'],T['B2']);put(V['W'],T['W']);c=int(CUT*SR);put(V['B3'][:c],T['B3a']);put(V['B3'][c:],T['B3b']+CUT)
out/=np.abs(out).max()/.95;wavfile.write('/home/claude/ks1/vo.wav',SR,(out*32767).astype(np.int16))
json.dump(K,open('/home/claude/sureowl-web/reel-kit/data/ks1_kf.json','w'))
json.dump({'T':T,'TOT':TOT,'S':S,'K':K,'EV':EV,'CUT':CUT},open('/home/claude/ks1/tl.json','w'))
os.makedirs('/tmp/claude-0/ks1/c',exist_ok=True)
open('/home/claude/ks1/run.sh','w').write(''.join('cd /home/claude/sureowl-web/reel-kit && NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/ks1/c/%s.mp4 >/tmp/claude-0/ks1/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in sorted(S,key=lambda q:-(q[2]-q[1]))))
print(T,TOT);print(K);[print(n,a,b,round(b-a,2)) for n,a,b in S]
