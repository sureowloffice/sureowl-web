import numpy as np,json
from scipy.io import wavfile
SR=44100
exec(open('/home/claude/h2b/tl.py').read().split('# (id, teks')[0].split('SR=44100;')[1].split('\n',1)[1])
V={k:load('vo/s_%s.wav'%k) for k in ['S1','W1','S2','S3','S4','S5']};d=lambda k:len(V[k])/SR
T={};S=[]
T['S1']=(.15,.15+d('S1'));S.append(['m1-premis',0])
m2=round(T['S1'][1]+.15,3);S.append(['m2-setrum',m2])
m3=round(m2+1.3,3);S.append(['m3-gelap',m3]);t=m3+.9;T['W1']=(t,t+d('W1'))
RX=round(T['W1'][1]+.3,3)
m4a=round(RX+.55,3);S.append(['m4a-pres',m4a]);t=m4a+.2;T['S2']=(t,t+d('S2'))
m4b=round(T['S2'][0]+2.45,3);S.append(['m4b-vanzz',m4b])
m4c=round(T['S2'][0]+6.0,3);S.append(['m4c-beresin',m4c])
m5a=round(T['S2'][1]+.35,3);S.append(['m5a-papan',m5a]);t=m5a+.15;T['S3']=(t,t+d('S3'))
m5b=round(T['S3'][0]+2.21,3);S.append(['m5b-pres',m5b])
m5c=round(T['S3'][1]+.2,3);S.append(['m5c-noob',m5c])
m6a=round(m5c+1.0,3);S.append(['m6a-tiang',m6a]);t=m6a+.15;T['S4']=(t,t+d('S4'))
m6b=round(T['S4'][0]+1.3,3);S.append(['m6b-bisik',m6b])
m7a=round(T['S4'][1]+.45,3);S.append(['m7a-cta',m7a]);t=m7a+.2;T['S5']=(t,t+d('S5'))
m7b=round(T['S5'][1]+.25,3);S.append(['m7b-jubah',m7b])
TOT=round(m7b+3.0,2)
for k in range(len(S)):S[k].append(S[k+1][1] if k+1<len(S) else TOT)
out=np.zeros(int(TOT*SR)+SR,np.float32)
for k in V:a=int(T[k][0]*SR);out[a:a+len(V[k])]+=V[k]
out/=np.abs(out).max()/.95;wavfile.write('vo.wav',SR,(out*32767).astype(np.int16))
env=np.convolve(np.abs(out),np.ones(int(SR*.05))/int(SR*.05),'same');env=np.clip(env/np.percentile(env[env>0.01],92),0,1)
PRES=['m1-premis','m4a-pres','m4c-beresin','m5b-pres','m6b-bisik','m7a-cta']
for n,a,b in S:
    if n in PRES:
        f=[round(float(env[min(len(env)-1,int((a+k/30)*SR))]),3) for k in range(int(round((b-a)*30))+2)]
        json.dump(f,open('/home/claude/sureowl-web/reel-kit/data/talk_%s.json'%n,'w'))
A={n:a for n,a,b in S}
# keyframe khusus (detik relatif shot)
KF={'jangan':round(T['S1'][0]+3.25-A['m1-premis'],3),'satu':round(T['S1'][0]+1.1-A['m1-premis'],3),'maaf':round(T['S3'][0]+4.8-A['m5b-pres'],3)}
json.dump({'T':T,'TOT':TOT,'S':S,'RX':RX,'KF':KF},open('tl.json','w'))
json.dump(KF,open('/home/claude/sureowl-web/reel-kit/data/h3m_kf.json','w'))
print(TOT,KF);[print(n,a,b,round(b-a,2)) for n,a,b in S]
open('run.sh','w').write(''.join('NT=D PRES=B node kota_shot.js %s %.3f /tmp/claude-0/h3m/c/%s.mp4 >/tmp/claude-0/h3m/c/%s.log 2>&1\n'%(n,b-a+.1,n,n) for n,a,b in S))
