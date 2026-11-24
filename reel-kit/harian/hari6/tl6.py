import numpy as np,json
from scipy.io import wavfile
SR=44100
def load(p):
    sr,x=wavfile.read(p);x=x.astype(np.float32)/32768;return x
V={k:load('vo/f_%s.wav'%k) for k in ['B1','B2','B3']};d=lambda k:len(V[k])/SR
T={'B1':.15};T['B2']=round(T['B1']+d('B1')+.35,3);T['B3']=round(T['B2']+d('B2')+.35,3)
b1,b2,b3=T['B1'],T['B2'],T['B3']
S=[['w1-hook',0],['w2-wifi',b1+3.95],['w2b-kena',b1+9.85],['w3-tembok',b1+12.35],['w4-menara',b1+18.35],
   ['w5-malam',b2-.15],['w5b-jadwal',b2+6.6],['w6-tiga',b3-.15],['w6b-cek',b3+3.9],['w7-lacak',b3+12.45],['w8-balik',b3+16.6],['w9-cta',b3+19.9]]
TOT=round(b3+d('B3')+.9,2)
S=[[n,round(a,3)] for n,a in S]
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
A={n:a for n,a,b in S}
K={'w3a':(b1+16.5)-A['w3-tembok'],'w4b0':(b1+18.65)-A['w4-menara'],'w4b1':(b1+23.0)-A['w4-menara'],
   'lah':(b3+9.84)-A['w6b-cek'],'mural':(b3+15.0)-A['w7-lacak']}
K={k:round(v,3) for k,v in K.items()}
EV={'names':[b3+5.94,b3+7.16,b3+8.14],'lah':b3+9.84,'siapa':b3+11.18,'mural':b3+15.0,'jadwal':b2+6.86,'kebagi':b2+5.4,'jam8':b2+.3,
    'satu':b1+12.44,'mental':b1+16.5,'terbuka':b1+18.65,'menara':b1+22.84,'kena':b1+9.9,'tiga':b3+.3,'besok':b3+19.9,'A':b3+21.2,'Bc':b3+22.5,'tag':b3+24.0}
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:i=int(T[k]*SR);out[i:i+len(V[k])]+=V[k]
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['w2-wifi','w2b-kena','w3-tembok','w5b-jadwal','w6-tiga','w6b-cek','w7-lacak','w8-balik','w9-cta']
for n,a,b in S:
    if n in PRES:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
json.dump(K,open('/home/claude/sureowl-web/reel-kit/data/h6_kf.json','w'))
json.dump({'T':T,'TOT':TOT,'S':S,'K':K,'EV':EV},open('tl.json','w'))
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h6/c/%s.mp4 >/tmp/claude-0/h6/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
print(TOT,K);[print(n,a,b,round(b-a,2)) for n,a,b in S]
